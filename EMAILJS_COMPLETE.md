# ✅ EmailJS Integration - Complete Setup Guide

## 📋 Overview

Your e-commerce app now has automated order confirmation emails:
- **Customer Email** - Order confirmation with all details
- **Admin Email** - Order notification for processing

All code is already integrated. You just need to:
1. Install the package
2. Setup EmailJS account
3. Add environment variables

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Package
```bash
npm install
```

### Step 2: Create EmailJS Account
1. Go to **https://www.emailjs.com**
2. Click **Sign Up** and create account
3. Verify email

### Step 3: Get Credentials

**Public Key:**
- Dashboard → **Account** → **General**
- Copy **Public Key**

**Service ID:**
- Dashboard → **Email Services** → **Add Service**
- Select **Gmail** → **Connect**
- Copy **Service ID** (usually `gmail_service`)

**Template IDs:**
- Dashboard → **Email Templates**
- Use templates from `EMAILJS_TEMPLATES.md`
- Copy Template IDs after creation

### Step 4: Update `.env.local`

Create `.env.local` in project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

VITE_EMAILJS_PUBLIC_KEY=pk_YOUR_PUBLIC_KEY
VITE_EMAILJS_SERVICE_ID=gmail_service
VITE_EMAILJS_CUSTOMER_TEMPLATE_ID=order_confirmation_customer
VITE_EMAILJS_ADMIN_TEMPLATE_ID=order_confirmation_admin
VITE_ADMIN_EMAIL=your-admin@gmail.com
```

### Step 5: Test
1. `npm run dev`
2. Go to checkout page
3. Fill form and place order
4. Check both emails ✅

---

## 📧 Email Templates

### Customer Email Contains:
✅ Order ID  
✅ Store name & ID  
✅ Product list with quantities  
✅ Total amount (itemized)  
✅ Shipping charges  
✅ Delivery address  
✅ Special notes  
✅ Track button  

### Admin Email Contains:
✅ Order ID (alert)  
✅ Store & owner details  
✅ Product list  
✅ Total order value  
✅ Delivery address  
✅ Special instructions  
✅ Action checklist  
✅ Dashboard link  

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `EMAILJS_TEMPLATES.md` | **Start here** - Copy-paste ready HTML templates |
| `EMAILJS_QUICK_START.md` | Fast setup checklist |
| `EMAILJS_SETUP_GUIDE.md` | Detailed step-by-step guide |

---

## 🔧 Technical Details

### Code Integration

**File: `src/lib/email-service.ts`**
- Initializes EmailJS with public key
- `sendOrderEmails()` function sends both emails
- Handles errors gracefully

**File: `src/routes/checkout.tsx`**
- After order is placed, calls `sendOrderEmails()`
- Shows success/warning toasts
- Doesn't block order creation if email fails

**File: `package.json`**
- Added `@emailjs/browser` dependency

### Email Flow Diagram

```
Customer Places Order
    ↓
Form Validation ✓
    ↓
Save Order to Supabase ✓
    ↓
Save Order Items ✓
    ↓
Send Customer Email
  ├─ Order confirmation
  ├─ Full details
  └─ Track link
    ↓
Send Admin Email
  ├─ New order alert
  ├─ Store & items
  └─ Action items
    ↓
Show Success Message ✓
    ↓
Redirect to /menu
```

---

## ✨ Features

### Automatic Order Processing
- ✅ Order ID generation (ORD-XXXXX format)
- ✅ Item tracking with quantities
- ✅ Shipping cost calculation
- ✅ Email formatting with HTML

### Error Handling
- ✅ Order created even if email fails
- ✅ Warning toast if email doesn't send
- ✅ Console logs for debugging
- ✅ Retry mechanism in EmailJS

### Professional Design
- ✅ Gradient headers
- ✅ Color-coded sections
- ✅ Responsive tables
- ✅ Mobile-friendly HTML

---

## 📝 Environment Variables Reference

```env
# EmailJS Public Key (from Account → General)
VITE_EMAILJS_PUBLIC_KEY=pk_xxxxxxxxxxxxx

# Gmail Service ID (from Email Services)
VITE_EMAILJS_SERVICE_ID=gmail_service

# Template IDs (from Email Templates)
VITE_EMAILJS_CUSTOMER_TEMPLATE_ID=order_confirmation_customer
VITE_EMAILJS_ADMIN_TEMPLATE_ID=order_confirmation_admin

# Admin notification email
VITE_ADMIN_EMAIL=admin@yourstore.com
```

---

## 🐛 Troubleshooting

### Issue: "VITE_EMAILJS_PUBLIC_KEY is not defined"
**Solution:** 
- Add all 5 environment variables to `.env.local`
- Restart dev server: `npm run dev`

### Issue: Emails not sending
**Solution:**
1. Check EmailJS **Logs** tab for errors
2. Verify template IDs match `.env.local`
3. Test template from EmailJS dashboard
4. Check Gmail **App Password** is set

### Issue: Email template showing `{{variable}}`
**Solution:**
- Use `{{double_braces}}` for variables
- Use `{{{triple_braces}}}` only for HTML content
- Verify variable names exactly match

### Issue: Only one email sends
**Solution:**
- Check both template IDs are correct
- Verify admin email address in `.env.local`
- Check EmailJS logs for specific template error

---

## 🎯 Next Steps (Optional Enhancements)

### Add More Email Templates
- Order shipped notification
- Order delivered confirmation
- Order cancellation notice
- Invoice attachment

### Customize Emails
- Add your logo/branding
- Change colors to match brand
- Add social media links
- Include FAQ section

### Advanced Features
- SMS notifications (integrating Twilio)
- Customer support chat
- Order tracking page
- Automatic status updates

---

## ✅ Verification Checklist

- [ ] `npm install` completed
- [ ] EmailJS account created
- [ ] Public Key copied
- [ ] Gmail Service connected
- [ ] App Password generated
- [ ] Customer template created (`order_confirmation_customer`)
- [ ] Admin template created (`order_confirmation_admin`)
- [ ] `.env.local` file has all 8 variables
- [ ] Dev server running (`npm run dev`)
- [ ] Test order placed
- [ ] Customer email received ✅
- [ ] Admin email received ✅

---

## 📞 Support

**If emails don't arrive:**

1. Check EmailJS Logs (Dashboard → Logs)
2. Verify `.env.local` has all variables
3. Confirm Gmail App Password is correct
4. Test template from EmailJS directly
5. Check spam/promotions folder

**EmailJS Help:** https://www.emailjs.com/docs/

---

## 🎉 Done!

Your e-commerce app now sends professional order confirmation emails to both customers and admins. Orders are tracked, organized, and automatically notified.

**Next: Test with a real order and verify email delivery!**

---

## 📄 Files Summary

### Documentation
- ✅ `EMAILJS_SETUP_GUIDE.md` - Full detailed guide
- ✅ `EMAILJS_QUICK_START.md` - Quick reference
- ✅ `EMAILJS_TEMPLATES.md` - HTML templates ready to copy
- ✅ `.env.example` - Environment variables template

### Code
- ✅ `src/lib/email-service.ts` - Email service
- ✅ `src/routes/checkout.tsx` - Updated with email integration
- ✅ `package.json` - @emailjs/browser added

---

**Created:** May 16, 2026  
**Status:** ✅ Complete & Ready to Use  
**Customer Site:** Hidden orders page, customer site shows home/menu/cart only  
**Admin Site:** Orders page accessible only to admins  
**Email:** Both customer and admin get notifications  
