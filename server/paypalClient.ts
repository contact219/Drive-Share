const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${response.statusText}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function createPayPalOrder(
  amountUSD: string,
  returnUrl: string,
  cancelUrl: string,
  metadata: Record<string, string>,
): Promise<{ id: string; approvalUrl: string }> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'USD', value: amountUSD },
          custom_id: JSON.stringify(metadata),
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: 'Rush Car Rentals',
        user_action: 'PAY_NOW',
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`PayPal create order failed: ${err}`);
  }

  const order = (await response.json()) as {
    id: string;
    links: { rel: string; href: string }[];
  };

  const approvalLink = order.links.find((l) => l.rel === 'approve');
  if (!approvalLink) {
    throw new Error('PayPal approval URL not found in order response');
  }

  return { id: order.id, approvalUrl: approvalLink.href };
}

export async function capturePayPalOrder(orderId: string): Promise<{
  status: string;
  id: string;
  purchase_units: { payments: { captures: { id: string; status: string }[] } }[];
}> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`PayPal capture failed: ${err}`);
  }

  return response.json() as Promise<{
    status: string;
    id: string;
    purchase_units: { payments: { captures: { id: string; status: string }[] } }[];
  }>;
}

export function getPayPalClientId(): string {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  if (!clientId) throw new Error('PAYPAL_CLIENT_ID is not set');
  return clientId;
}
