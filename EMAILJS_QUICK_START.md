# EmailJS Integration - Quick Start

## 🚀 Installation Steps

### Step 1: Install EmailJS Package

```bash
npm install @emailjs/browser
```

### Step 2: Get Your EmailJS Credentials

**Visit:** https://www.emailjs.com

#### 2.1 Get Public Key
- Login to EmailJS
- Go to **Account** → **General**
- Copy **Public Key**

#### 2.2 Setup Gmail Service
- Go to **Email Services**
- Click **Add Service** → Select **Gmail**
- Click **Connect with Gmail** → Allow access
- Service name will appear (e.g., `gmail_service`)
- **Copy the Service ID**

**Important:** Enable 2-Step Verification on Gmail and generate an App Password:
- https://myaccount.google.com/apppasswords
- Select Mail + Device
- Copy the generated password

#### 2.3 Create Email Templates

**Create Template 1: Customer Confirmation**
- Template Name: `order_confirmation_customer`
- Subject: `Your Order Confirmed - Order ID: {{order_id}}`
- Use HTML from `EMAILJS_SETUP_GUIDE.md`
- Click **Save**
- **Copy Template ID**

**Create Template 2: Admin Notification**
- Template Name: `order_confirmation_admin`
- Subject: `[NEW ORDER] {{order_id}} - {{store_name}}`
- Use HTML from `EMAILJS_SETUP_GUIDE.md`
- Click **Save**
- **Copy Template ID**

### Step 3: Update `.env.local`

Create `.env.local` file in your project root with:

```env
# Supabase (you already have these)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# EmailJS
VITE_EMAILJS_PUBLIC_KEY=pk_YOUR_PUBLIC_KEY_HERE
VITE_EMAILJS_SERVICE_ID=gmail_service
VITE_EMAILJS_CUSTOMER_TEMPLATE_ID=order_confirmation_customer
VITE_EMAILJS_ADMIN_TEMPLATE_ID=order_confirmation_admin
VITE_ADMIN_EMAIL=your-admin-email@gmail.com
```

### Step 4: Done! ✅

Everything is already integrated. Just test:

1. Run `npm run dev`
2. Go to checkout page
3. Fill in form and place order
4. Check both emails arrive in:
   - **Customer email** (from form)
   - **Admin email** (VITE_ADMIN_EMAIL)

---

## 📧 What Each Email Contains

### Customer Email 🛍️
- Order ID
- Store info
- Product list with quantities
- Total amount with shipping
- Delivery address
- Special notes

### Admin Email 🔔
- Order ID (same)
- Store & owner details
- Product list
- Total amount
- Delivery address
- Link to admin dashboard

---

## ✅ Testing Checklist

- [ ] EmailJS account created
- [ ] Gmail service connected
- [ ] App password generated
- [ ] Customer template created
- [ ] Admin template created
- [ ] `.env.local` file updated with all 6 keys
- [ ] `npm install` run to install @emailjs/browser
- [ ] Dev server running
- [ ] Test order placed
- [ ] Customer email received
- [ ] Admin email received

---

## 🐛 Troubleshooting

### Email not sending?

**Check 1: Environment Variables**
```bash
# Verify your .env.local has:
VITE_EMAILJS_PUBLIC_KEY
VITE_EMAILJS_SERVICE_ID
VITE_EMAILJS_CUSTOMER_TEMPLATE_ID
VITE_EMAILJS_ADMIN_TEMPLATE_ID
VITE_ADMIN_EMAIL
```

**Check 2: Browser Console**
```javascript
// Check if EmailJS initialized
console.log(emailjs.publicKey) // Should show your key
```

**Check 3: EmailJS Dashboard**
- Go to **Logs** tab
- See if email send attempts appear
- Check error messages

**Check 4: Gmail Settings**
- Make sure **2-Step Verification** is enabled
- Use **App Password**, not regular Gmail password
- Check Gmail **Less Secure Apps** is not blocking

### Template not rendering correctly?

- Check variable names use `{{double_braces}}`
- Test send from EmailJS dashboard first
- Validate HTML is properly formatted

### Order placed but email shows warning?

- Order still created successfully ✅
- Email will retry or you can resend manually
- Check admin email still received notification

---

## 📝 File Changes Made

1. ✅ `src/lib/email-service.ts` - Email service with OrderEmailData interface
2. ✅ `src/routes/checkout.tsx` - Added email sending after order creation
3. ✅ `package.json` - Added @emailjs/browser dependency
4. ✅ `.env.example` - Template for environment variables
5. ✅ `EMAILJS_SETUP_GUIDE.md` - Full setup documentation

---

## 🎯 What Happens During Checkout

```
Customer fills form
    ↓
Clicks "Place Order"
    ↓
Order saved to Supabase
    ↓
Order items inserted
    ↓
📧 Customer confirmation email sent
    ↓
📧 Admin notification email sent
    ↓
Customer sees success message
    ↓
Redirected to menu page
```

---

## Next Steps (Optional)

- [ ] Customize email templates with your branding
- [ ] Add order tracking link in emails
- [ ] Create order status update emails (packed, shipped, delivered)
- [ ] Setup email for order cancellation
- [ ] Add customer support email to templates

---

**Need help?** Check the `EMAILJS_SETUP_GUIDE.md` for detailed instructions.
