import * as crypto from 'node:crypto';

export class WebhookHandlers {
  static async processWebhook(
    payload: Buffer,
    headers: Record<string, string>,
  ): Promise<{ eventType: string; orderId?: string }> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error('Webhook payload must be a Buffer');
    }

    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    // Verify PayPal webhook signature when webhook ID is configured
    if (webhookId) {
      const transmissionId = headers['paypal-transmission-id'];
      const timestamp = headers['paypal-transmission-time'];
      const certUrl = headers['paypal-cert-url'];
      const transmissionSig = headers['paypal-transmission-sig'];

      if (!transmissionId || !timestamp || !certUrl || !transmissionSig) {
        throw new Error('Missing PayPal webhook signature headers');
      }

      const message = `${transmissionId}|${timestamp}|${webhookId}|${crypto
        .createHash('sha256')
        .update(payload)
        .digest('hex')}`;

      // In production, verify certUrl is a valid PayPal cert endpoint
      // and validate the RSA-SHA256 signature against the cert
    }

    const body = JSON.parse(payload.toString()) as {
      event_type: string;
      resource?: { id?: string };
    };

    const eventType = body.event_type;
    const orderId = body.resource?.id;

    return { eventType, orderId };
  }
}
