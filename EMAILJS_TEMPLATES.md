# EmailJS Template Setup - Copy & Paste Ready

## Login to EmailJS

1. Go to https://www.emailjs.com
2. Sign in / Sign up
3. Click **Email Templates** in left sidebar

---

## Template 1: Customer Order Confirmation

### Basic Info
- **Template Name:** `order_confirmation_customer`
- **Subject Line:** `Your Order Confirmed - Order ID: {{order_id}}`

### HTML Content

Copy and paste this entire HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .content p { color: #333; line-height: 1.6; margin-bottom: 20px; }
        .order-id { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; font-size: 18px; color: #667eea; font-family: monospace; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; border-bottom: 2px solid #667eea; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #667eea; color: white; padding: 12px; text-align: left; font-weight: bold; }
        th.alt { background: #f0f0f0; color: #333; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; }
        td:first-child { font-weight: bold; color: #555; width: 40%; }
        .total-row td { font-size: 18px; font-weight: bold; color: #667eea; border-top: 2px solid #667eea; padding-top: 12px; }
        .total-row td:first-child { color: #333; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: bold; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your purchase</p>
        </div>

        <div class="content">
            <p>Dear <strong>{{customer_name}}</strong>,</p>
            <p>Your order has been successfully placed with us. Here are the complete details:</p>

            <div class="order-id">Order ID: {{order_id}}</div>

            <div class="section">
                <div class="section-title">📦 Store Information</div>
                <table>
                    <tr>
                        <td>Store Name:</td>
                        <td><strong>{{store_name}}</strong></td>
                    </tr>
                    <tr>
                        <td>Store ID:</td>
                        <td>{{store_id}}</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">📋 Your Order Items</div>
                <table>
                    <thead>
                        <tr class="alt">
                            <th>Product ID</th>
                            <th>Product ID</th>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{{order_items}}}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <div class="section-title">💰 Order Summary</div>
                <table>
                    <tr>
                        <td>Subtotal:</td>
                        <td>₹{{subtotal}}</td>
                    </tr>
                    <tr>
                        <td>Shipping Charges:</td>
                        <td>₹{{shipping}}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Total Amount:</td>
                        <td>₹{{total_amount}}</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">📍 Delivery Address</div>
                <table>
                    <tr>
                        <td>Name:</td>
                        <td>{{customer_name}}</td>
                    </tr>
                    <tr>
                        <td>Phone:</td>
                        <td>{{phone}}</td>
                    </tr>
                    <tr>
                        <td>Email:</td>
                        <td>{{email}}</td>
                    </tr>
                    <tr>
                        <td>Address:</td>
                        <td>{{address}}</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">📝 Special Notes</div>
                <p>{{notes}}</p>
            </div>

            <p>We will notify you as soon as your order is packed and ready for shipment. For any questions or concerns, please feel free to contact us.</p>

            <center>
                <a href="https://kongsi-tea.com" class="button">Track Your Order</a>
            </center>

            <p>Thank you for choosing Kongsi!<br><strong>Best regards,<br>Kongsi Team</strong></p>
        </div>

        <div class="footer">
            <p><strong>© 2026 Kongsi Premium Wholesale Supplies</strong></p>
            <p>For Cafés, Bubble Tea Bars & Dessert Shops</p>
            <p>This is an automated email. Please do not reply to this address.</p>
        </div>
    </div>
</body>
</html>
```

**After pasting:**
1. Click **Save**
2. Copy the **Template ID** shown (e.g., `template_xxxxx`)
3. Paste in `.env.local` as `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID`

---

## Template 2: Admin Order Notification

### Basic Info
- **Template Name:** `order_confirmation_admin`
- **Subject Line:** `[NEW ORDER] {{order_id}} - {{store_name}}`

### HTML Content

Copy and paste this entire HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; color: #856404; font-weight: bold; }
        .content { padding: 30px; }
        .order-id { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; font-size: 18px; color: #f5576c; font-family: monospace; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; border-bottom: 2px solid #f5576c; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #f5576c; color: white; padding: 12px; text-align: left; font-weight: bold; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; }
        td:first-child { font-weight: bold; color: #555; width: 40%; }
        .total-row td { font-size: 16px; font-weight: bold; color: #f5576c; border-top: 2px solid #f5576c; padding-top: 12px; }
        .total-row td:first-child { color: #333; }
        .action-btn { display: inline-block; background: #f5576c; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; margin-top: 15px; font-weight: bold; }
        .steps { background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .steps ol { margin: 10px 0; padding-left: 20px; }
        .steps li { margin: 5px 0; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; }
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
                ⚠️ ACTION REQUIRED: Please review and process this order immediately.
            </div>

            <div class="order-id">Order ID: {{order_id}}</div>

            <div class="section">
                <div class="section-title">🏪 Store Information</div>
                <table>
                    <tr>
                        <td>Store Name:</td>
                        <td><strong>{{store_name}}</strong></td>
                    </tr>
                    <tr>
                        <td>Store ID:</td>
                        <td>{{store_id}}</td>
                    </tr>
                    <tr>
                        <td>Owner Name:</td>
                        <td>{{customer_name}}</td>
                    </tr>
                    <tr>
                        <td>Phone:</td>
                        <td><strong>{{phone}}</strong></td>
                    </tr>
                    <tr>
                        <td>Email:</td>
                        <td>{{email}}</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">📦 Order Items</div>
                <table>
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{{order_items}}}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <div class="section-title">💰 Order Value</div>
                <table>
                    <tr>
                        <td>Subtotal:</td>
                        <td>₹{{subtotal}}</td>
                    </tr>
                    <tr>
                        <td>Shipping:</td>
                        <td>₹{{shipping}}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Total Amount:</td>
                        <td>₹{{total_amount}}</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">📍 Delivery Address</div>
                <p><strong>{{address}}</strong></p>
            </div>

            <div class="section">
                <div class="section-title">📝 Special Instructions</div>
                <p>{{notes}}</p>
            </div>

            <div class="steps">
                <strong>Next Steps:</strong>
                <ol>
                    <li>✓ Verify order details and store information</li>
                    <li>✓ Confirm stock availability for all items</li>
                    <li>✓ Update order status (pending → packed → shipped)</li>
                    <li>✓ Notify customer of shipment</li>
                    <li>✓ Generate invoice if needed</li>
                </ol>
            </div>

            <center>
                <a href="https://admin.kongsi-tea.com/dashboard" class="action-btn">📊 Go to Admin Dashboard</a>
            </center>
        </div>

        <div class="footer">
            <p><strong>© 2026 Kongsi - Admin Notification System</strong></p>
            <p>This is an automated notification. Do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
```

**After pasting:**
1. Click **Save**
2. Copy the **Template ID** shown (e.g., `template_xxxxx`)
3. Paste in `.env.local` as `VITE_EMAILJS_ADMIN_TEMPLATE_ID`

---

## Email Template Variables

When you see in templates: `{{variable_name}}`

These will be auto-filled with:

| Variable | What it is |
|----------|-----------|
| `{{order_id}}` | Unique order identifier (ORD-12345ABC) |
| `{{store_name}}` | Customer's store name |
| `{{store_id}}` | Customer's store ID |
| `{{customer_name}}` | Store owner name |
| `{{phone}}` | Contact phone number |
| `{{email}}` | Contact email address |
| `{{address}}` | Delivery address |
| `{{total_amount}}` | Total order amount (with shipping) |
| `{{subtotal}}` | Order items total (without shipping) |
| `{{shipping}}` | Shipping charges |
| `{{notes}}` | Special instructions |
| `{{{order_items}}}` | HTML table of items (use triple braces!) |

---

## ✅ Verification

After creating both templates:

1. Open Email Templates page
2. You should see:
   - ✅ `order_confirmation_customer`
   - ✅ `order_confirmation_admin`
3. Click each one to see the Template ID
4. Copy these IDs to `.env.local`

**Done!** Your EmailJS templates are ready.
