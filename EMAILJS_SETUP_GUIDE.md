# EmailJS Setup Guide for Order Confirmations

## Step 1: Sign Up and Get Credentials

1. Go to [EmailJS.com](https://www.emailjs.com)
2. Click **Sign Up** and create an account (free tier available)
3. After login, go to **Account** → **General**
4. Copy your **Public Key** (you'll need this for the frontend)

---

## Step 2: Setup Email Service (Gmail)

1. In EmailJS dashboard, go to **Email Services** on the left sidebar
2. Click **Add Service**
3. Select **Gmail**
4. Click **Connect with Gmail**
5. Allow EmailJS to access your Gmail account
6. Name the service: `gmail_service` (or any name you prefer)
7. **Copy the Service ID** - you'll need this

### Gmail App Password Setup (Important!)
- Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Select **Mail** and **Windows Computer** (or your device)
- Generate app password
- Use this in EmailJS instead of your regular Gmail password

---

## Step 3: Create Email Templates in EmailJS

### Template 1: Customer Order Confirmation

1. Go to **Email Templates** in EmailJS dashboard
2. Click **Create New Template**
3. **Template Name:** `order_confirmation_customer`
4. **Subject:** `Your Order Confirmed - Order ID: {{order_id}}`
5. **Email Content:** Replace with this HTML template:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .order-id { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; font-size: 18px; color: #667eea; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; border-bottom: 2px solid #667eea; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; border-bottom: 1px solid #ddd; }
        td { padding: 10px; border-bottom: 1px solid #eee; }
        .row-label { font-weight: bold; color: #333; width: 40%; }
        .row-value { color: #666; }
        .total { font-size: 20px; font-weight: bold; color: #667eea; }
        .items-table { width: 100%; margin: 15px 0; }
        .items-table th { background: #667eea; color: white; }
        .items-table td { padding: 12px; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your purchase</p>
        </div>

        <div class="content">
            <p>Dear {{customer_name}},</p>
            <p>Your order has been successfully placed. Here are the details:</p>

            <div class="order-id">Order ID: {{order_id}}</div>

            <div class="section">
                <div class="section-title">📦 Store Information</div>
                <table>
                    <tr>
                        <td class="row-label">Store Name:</td>
                        <td class="row-value">{{store_name}}</td>
                    </tr>
                    <tr>
                        <td class="row-label">Store ID:</td>
                        <td class="row-value">{{store_id}}</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">📋 Order Items</div>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{#order_items}}
                        <tr>
                            <td>{{product_name}}</td>
                            <td>{{quantity}}</td>
                            <td>₹{{price}}</td>
                            <td>₹{{subtotal}}</td>
                        </tr>
                        {{/order_items}}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <div class="section-title">💰 Order Summary</div>
                <table>
                    <tr>
                        <td class="row-label">Subtotal:</td>
                        <td class="row-value">₹{{subtotal}}</td>
                    </tr>
                    <tr>
                        <td class="row-label">Shipping:</td>
                        <td class="row-value">₹{{shipping}}</td>
                    </tr>
                    <tr>
                        <td class="row-label total">Total Amount:</td>
                        <td class="row-value total">₹{{total_amount}}</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">📍 Delivery Details</div>
                <table>
                    <tr>
                        <td class="row-label">Name:</td>
                        <td class="row-value">{{customer_name}}</td>
                    </tr>
                    <tr>
                        <td class="row-label">Phone:</td>
                        <td class="row-value">{{phone}}</td>
                    </tr>
                    <tr>
                        <td class="row-label">Address:</td>
                        <td class="row-value">{{address}}</td>
                    </tr>
                    <tr>
                        <td class="row-label">Email:</td>
                        <td class="row-value">{{email}}</td>
                    </tr>
                </table>
            </div>

            {{#notes}}
            <div class="section">
                <div class="section-title">📝 Special Notes</div>
                <p>{{notes}}</p>
            </div>
            {{/notes}}

            <p>We'll notify you once your order is shipped. If you have any questions, please contact us.</p>
            <a href="https://kongsi-tea.com" class="button">Track Your Order</a>

            <p>Best regards,<br><strong>Kongsi Team</strong></p>
        </div>

        <div class="footer">
            <p>© 2026 Kongsi. Premium Wholesale Supplies for Cafés & Bubble Tea Bars.</p>
            <p>This is an automated email. Please do not reply to this address.</p>
        </div>
    </div>
</body>
</html>
```

6. Click **Save**
7. **Copy the Template ID** (e.g., `template_xxxxx`)

---

### Template 2: Admin Order Notification

1. Click **Create New Template** again
2. **Template Name:** `order_confirmation_admin`
3. **Subject:** `[NEW ORDER] {{order_id}} - {{store_name}}`
4. **Email Content:**

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .alert { background: #ffeaa7; border-left: 4px solid #fdcb6e; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .content { padding: 30px; }
        .order-id { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; font-size: 18px; color: #667eea; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; border-bottom: 2px solid #667eea; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; border-bottom: 1px solid #ddd; }
        td { padding: 10px; border-bottom: 1px solid #eee; }
        .row-label { font-weight: bold; color: #333; width: 40%; }
        .row-value { color: #666; }
        .total { font-size: 18px; font-weight: bold; color: #667eea; }
        .items-table { width: 100%; margin: 15px 0; }
        .items-table th { background: #667eea; color: white; }
        .items-table td { padding: 12px; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; }
        .action-btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 New Order Received!</h1>
            <p>{{order_id}}</p>
        </div>

        <div class="content">
            <div class="alert">
                <strong>Action Required:</strong> Please review and process this order in your admin dashboard.
            </div>

            <div class="order-id">Order ID: {{order_id}}</div>

            <div class="section">
                <div class="section-title">🏪 Store Information</div>
                <table>
                    <tr>
                        <td class="row-label">Store Name:</td>
                        <td class="row-value"><strong>{{store_name}}</strong></td>
                    </tr>
                    <tr>
                        <td class="row-label">Store ID:</td>
                        <td class="row-value">{{store_id}}</td>
                    </tr>
                    <tr>
                        <td class="row-label">Owner:</td>
                        <td class="row-value">{{customer_name}}</td>
                    </tr>
                    <tr>
                        <td class="row-label">Phone:</td>
                        <td class="row-value">{{phone}}</td>
                    </tr>
                    <tr>
                        <td class="row-label">Email:</td>
                        <td class="row-value">{{email}}</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">📦 Order Items</div>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{#order_items}}
                        <tr>
                            <td>{{product_name}}</td>
                            <td>{{quantity}}</td>
                            <td>₹{{price}}</td>
                            <td>₹{{subtotal}}</td>
                        </tr>
                        {{/order_items}}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <div class="section-title">💰 Order Value</div>
                <table>
                    <tr>
                        <td class="row-label">Subtotal:</td>
                        <td class="row-value">₹{{subtotal}}</td>
                    </tr>
                    <tr>
                        <td class="row-label">Shipping:</td>
                        <td class="row-value">₹{{shipping}}</td>
                    </tr>
                    <tr>
                        <td class="row-label total">Total:</td>
                        <td class="row-value total">₹{{total_amount}}</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">📍 Delivery Address</div>
                <p><strong>{{address}}</strong></p>
            </div>

            {{#notes}}
            <div class="section">
                <div class="section-title">📝 Special Instructions</div>
                <p>{{notes}}</p>
            </div>
            {{/notes}}

            <p style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 6px;">
                <strong>Next Steps:</strong><br>
                1. Verify the order details<br>
                2. Confirm stock availability<br>
                3. Update order status (pending → packed → shipped → delivered)<br>
                4. Notify customer of shipment
            </p>

            <a href="https://admin.kongsi-tea.com/dashboard" class="action-btn">Go to Admin Dashboard</a>
        </div>

        <div class="footer">
            <p>© 2026 Kongsi. Premium Wholesale Supplies for Cafés & Bubble Tea Bars.</p>
        </div>
    </div>
</body>
</html>
```

5. Click **Save**
6. **Copy the Template ID**

---

## Step 4: Add EmailJS to Your Project

### Install EmailJS
```bash
npm install @emailjs/browser
```

### Update `.env` file
Add these to your `.env.local`:

```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_CUSTOMER_TEMPLATE_ID=order_confirmation_customer
VITE_EMAILJS_ADMIN_TEMPLATE_ID=order_confirmation_admin
VITE_ADMIN_EMAIL=your-admin-email@gmail.com
```

**Get these values from:**
- **Public Key** → EmailJS Account → General
- **Service ID** → EmailJS Email Services
- **Template IDs** → EmailJS Email Templates
- **Admin Email** → The email where you want order notifications

---

## Step 5: Create EmailJS Service File

Create `src/lib/email-service.ts`:

```typescript
import emailjs from '@emailjs/browser';

// Initialize EmailJS
if (!emailjs.publicKey) {
  emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
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
  notes?: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

export async function sendOrderEmails(data: OrderEmailData) {
  try {
    // Format order items as a string for email template
    const itemsHTML = data.order_items
      .map(
        (item) =>
          `<tr>
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price}</td>
            <td>₹${item.subtotal}</td>
          </tr>`
      )
      .join('');

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
      notes: data.notes || 'None',
      order_items: itemsHTML,
      to_email: data.email, // For customer email
      to_admin_email: import.meta.env.VITE_ADMIN_EMAIL, // For admin email
    };

    // Send customer confirmation email
    const customerResponse = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID,
      {
        ...templateParams,
        to_email: data.email,
      }
    );

    console.log('Customer email sent:', customerResponse.status);

    // Send admin notification email
    const adminResponse = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID,
      {
        ...templateParams,
        to_email: import.meta.env.VITE_ADMIN_EMAIL,
      }
    );

    console.log('Admin email sent:', adminResponse.status);

    return {
      success: true,
      customerEmail: customerResponse,
      adminEmail: adminResponse,
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}
```

---

## Step 6: Update Checkout to Send Emails

Update `src/routes/checkout.tsx` to integrate email sending:

```typescript
// Add this import at the top
import { sendOrderEmails } from "@/lib/email-service";

// Inside the placeOrder function, after successfully inserting order items:

async function placeOrder() {
  if (!validateForm()) {
    toast.error("Please fix the errors in the form");
    return;
  }

  setSubmitting(true);
  try {
    // Create order
    const newOrderId = genId("ORD-");
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_id: newOrderId,
        user_id: user!.id,
        store_name: form.store_name,
        store_id: form.store_id,
        customer_name: form.owner_name,
        phone: form.phone,
        email: form.email,
        address: form.delivery_address,
        total_amount: grand,
        notes: form.notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Insert order items
    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((it) => ({
        order_id: order.id,
        product_id: it.id,
        product_name: it.name,
        quantity: it.qty,
        price: it.price,
        subtotal: it.price * it.qty,
      }))
    );

    if (itemsErr) throw itemsErr;

    // Send emails to customer and admin
    try {
      await sendOrderEmails({
        order_id: newOrderId,
        store_name: form.store_name,
        store_id: form.store_id,
        customer_name: form.owner_name,
        phone: form.phone,
        email: form.email,
        address: form.delivery_address,
        total_amount: grand,
        subtotal: total,
        shipping: shipping,
        notes: form.notes,
        order_items: items.map((it) => ({
          product_name: it.name,
          quantity: it.qty,
          price: it.price,
          subtotal: it.price * it.qty,
        })),
      });
      toast.success("Order confirmation sent to your email!");
    } catch (emailError) {
      console.warn("Email sending failed, but order was created:", emailError);
      toast.warning("Order placed but email notification failed. We'll send it shortly.");
    }

    clear();
    setOrderId(newOrderId);
    setOrderPlaced(true);
    toast.success("Order placed successfully!");
  } catch (e) {
    const err = e as Error;
    toast.error(err.message || "Failed to place order");
    console.error(err);
  } finally {
    setSubmitting(false);
  }
}
```

---

## Step 7: Test the Setup

1. **Fill checkout form** with a test order
2. **Click Place Order**
3. Check:
   - Customer email inbox
   - Admin email inbox
4. If emails don't arrive:
   - Check EmailJS dashboard for **error logs**
   - Verify environment variables are correct
   - Check Gmail **App Password** is set correctly

---

## Troubleshooting

### Email not sending?
1. **Missing env variables** → Check `.env.local` has all keys
2. **Wrong credentials** → Verify Public Key, Service ID, Template IDs
3. **Gmail security** → Use **App Password**, not regular password
4. **Rate limit** → EmailJS free tier has rate limits (check dashboard)

### Email template not rendering?
1. **Template variables** → Use `{{variable_name}}` format (double braces)
2. **Test send** → Use EmailJS dashboard to test template before integrating
3. **HTML validation** → Make sure HTML is valid

### Variables showing as `undefined`?
1. Check variable names match in `sendOrderEmails()` function
2. Make sure data is passed correctly from checkout
3. Debug by checking EmailJS error logs

---

## Email Template Variables Reference

| Variable | Example |
|----------|---------|
| `{{order_id}}` | ORD-12345ABC |
| `{{store_name}}` | My Cafe |
| `{{store_id}}` | ST-001 |
| `{{customer_name}}` | John Doe |
| `{{phone}}` | 9876543210 |
| `{{email}}` | john@example.com |
| `{{address}}` | 123 Main St, City |
| `{{total_amount}}` | 5000 |
| `{{subtotal}}` | 4500 |
| `{{shipping}}` | 500 |
| `{{notes}}` | Special instructions |
| `{{order_items}}` | HTML table of items |

---

## Summary

✅ **What's configured:**
- Customer receives order confirmation with all details
- Admin receives new order notification with action items
- Both emails have professional formatting
- Order items displayed in formatted tables
- Total amount and shipping clearly shown

✅ **What happens:**
1. Customer places order
2. Order saved to Supabase
3. Both customer & admin emails sent
4. Success message shown
5. Customer redirected to menu

---

## Next Steps (Optional)

- Add **email verification** during signup
- Create **shipment notification** template
- Add **order cancellation** email
- Setup **admin reply-to** for customer inquiries
