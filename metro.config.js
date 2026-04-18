const path = require("path");

// Patch fs.watch BEFORE Metro loads its watchers.
// Metro's FallbackWatcher crashes with ENOENT when Replit's volatile
// workflow-log files disappear between the directory scan and the fs.watch call.
// This patch silently returns a no-op emitter instead of crashing the process.
const fs = require("fs");
const { EventEmitter } = require("events");
const _origWatch = fs.watch;
fs.watch = function patchedWatch(filename, options, listener) {
  try {
    return _origWatch.call(this, filename, options, listener);
  } catch (err) {
    if (err.code === "ENOENT") {
      const noop = new EventEmitter();
      noop.close = () => {};
      return noop;
    }
    throw err;
  }
};

// Patch the WebSocket Server to send keep-alive pings every 25 seconds.
// Metro's HMR WebSocket server has no built-in heartbeat, so Replit's proxy
// closes the connection after ~60-120 seconds of no WebSocket frames.
// Pinging every 25s keeps the connection alive indefinitely.
try {
  const ws = require("ws");
  const _OrigServer = ws.Server || ws.WebSocketServer;
  if (_OrigServer && !_OrigServer._replitPatched) {
    const PatchedServer = function (options, callback) {
      const server = new _OrigServer(options, callback);
      server.on("connection", (socket) => {
        const iv = setInterval(() => {
          if (socket.readyState === (ws.OPEN || 1)) {
            try { socket.ping(); } catch (_) {}
          }
        }, 25000);
        socket.on("close", () => clearInterval(iv));
      });
      return server;
    };
    PatchedServer.prototype = _OrigServer.prototype;
    PatchedServer._replitPatched = true;
    ws.Server = PatchedServer;
    ws.WebSocketServer = PatchedServer;
  }
} catch (_) {}

const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Prevent Metro from resolving modules inside .local or .git
config.resolver.blockList = [/\.local\/.*/, /\.git\/.*/];

// On web, redirect @stripe/stripe-react-native to a no-op stub
// because the native SDK imports react-native internals not available on web.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === "web" &&
    moduleName === "@stripe/stripe-react-native"
  ) {
    return {
      filePath: path.resolve(
        __dirname,
        "client/stubs/stripe-react-native.web.js"
      ),
      type: "sourceFile",
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
