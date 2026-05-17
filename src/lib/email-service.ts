import emailjs from '@emailjs/browser';
import { formatINR } from './format';

const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_CUSTOMER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID;
const EMAILJS_ADMIN_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID;
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const isEmailjsConfigured =
  Boolean(EMAILJS_PUBLIC_KEY) &&
  Boolean(EMAILJS_SERVICE_ID) &&
  Boolean(EMAILJS_CUSTOMER_TEMPLATE_ID) &&
  Boolean(EMAILJS_ADMIN_TEMPLATE_ID) &&
  Boolean(ADMIN_EMAIL);

if (isEmailjsConfigured) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
} else {
  console.warn(
    "EmailJS is not fully configured. Email features will be disabled until the required environment variables are added."
  );
}

export interface OrderEmailData {
  order_id: string;
  store_name: string;
  store_id: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  total_amount: number;
  subtotal: number;
  shipping: number;
  payment_method?: string;
  shipping_method?: string;
  notes?: string;
  order_items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

export async function sendOrderEmails(data: OrderEmailData) {
  if (!isEmailjsConfigured) {
    throw new Error(
      "EmailJS is not configured. Please set VITE_EMAILJS_PUBLIC_KEY, VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_CUSTOMER_TEMPLATE_ID, VITE_EMAILJS_ADMIN_TEMPLATE_ID, and VITE_ADMIN_EMAIL."
    );
  }

  try {
    const itemsHTML = data.order_items
      .map(
        (item) =>
          `<tr>
            <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:13px;color:#333;">
              ${item.product_name}<br />
              <span style="color:#888;font-size:11px;">ID: ${item.product_id}</span>
            </td>
            <td align="center" style="padding:12px 8px;border-bottom:1px solid #eee;font-size:13px;color:#333;">${item.quantity}</td>
            <td align="right" style="padding:12px 8px;border-bottom:1px solid #eee;font-size:13px;color:#333;">${formatINR(item.subtotal)}</td>
          </tr>`
      )
      .join('');

    const orderItemsText = data.order_items
      .map(
        (item) =>
          `${item.product_name} (ID: ${item.product_id}) — ${item.quantity} × ${formatINR(item.price)} = ${formatINR(item.subtotal)}`
      )
      .join('\n');

    const templateParams = {
      order_id: data.order_id,
      store_name: data.store_name,
      store_id: data.store_id,
      customer_name: data.customer_name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      total_amount: data.total_amount,
      subtotal: data.subtotal,
      shipping: data.shipping,
      total_amount_formatted: formatINR(data.total_amount),
      subtotal_formatted: formatINR(data.subtotal),
      shipping_formatted: formatINR(data.shipping),
      payment_method: data.payment_method || 'Online Payment',
      shipping_method: data.shipping_method || 'Standard Delivery',
      notes: data.notes || 'None',
      order_items: itemsHTML,
      order_items_text: orderItemsText,
    };

    console.log('Sending customer confirmation email...');
    const customerResponse = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_CUSTOMER_TEMPLATE_ID,
      {
        ...templateParams,
        to_email: data.email,
      }
    );
    console.log('✅ Customer email sent:', customerResponse.status);

    console.log('Sending admin notification email...');
    const adminResponse = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_ADMIN_TEMPLATE_ID,
      {
        ...templateParams,
        to_email: ADMIN_EMAIL,
      }
    );
    console.log('✅ Admin email sent:', adminResponse.status);

    return {
      success: true,
      customerEmail: customerResponse,
      adminEmail: adminResponse,
    };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
}
