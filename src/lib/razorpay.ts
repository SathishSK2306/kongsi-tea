const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_xxxxxxxxx";
const IS_PLACEHOLDER_KEY = RAZORPAY_KEY_ID === "rzp_test_xxxxxxxxx";

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export async function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Razorpay checkout can only be initialized in the browser.");
  }

  if (IS_PLACEHOLDER_KEY) {
    return;
  }

  if ((window as any).Razorpay) {
    return;
  }

  const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
  const loadPromise = new Promise<void>((resolve, reject) => {
    if ((window as any).Razorpay) return resolve();

    const bindEvents = (script: HTMLScriptElement) => {
      const cleanup = () => {
        script.removeEventListener("load", onLoad);
        script.removeEventListener("error", onError);
      };

      const onLoad = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("Failed to load Razorpay script."));
      };

      script.addEventListener("load", onLoad);
      script.addEventListener("error", onError);
    };

    if (existingScript) {
      bindEvents(existingScript as HTMLScriptElement);
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    bindEvents(script);
    document.body.appendChild(script);
  });

  const timeoutPromise = new Promise<void>((_, reject) => {
    const timer = window.setTimeout(() => reject(new Error("Razorpay script load timed out. Please try again.")), 12000);
    loadPromise.finally(() => window.clearTimeout(timer));
  });

  await Promise.race([loadPromise, timeoutPromise]);
}

function simulateRazorpayCheckout(options: {
  amount: number;
  name: string;
  description: string;
  email: string;
  contact: string;
}): Promise<RazorpayPaymentResponse> {
  return new Promise<RazorpayPaymentResponse>((resolve, reject) => {
    const message =
      "Razorpay is running in dummy mode with the placeholder test key.\n\n" +
      "Click OK to simulate a successful payment, or Cancel to abort.";

    const confirmed = window.confirm(message);
    if (!confirmed) {
      reject(new Error("Dummy payment was cancelled."));
      return;
    }

    window.setTimeout(() => {
      resolve({
        razorpay_payment_id: `DUMMY_PAY_${Date.now()}`,
        razorpay_order_id: `DUMMY_ORDER_${Date.now()}`,
        razorpay_signature: "DUMMY_SIGNATURE",
      });
    }, 600);
  });
}

export async function openRazorpayCheckout(options: {
  amount: number;
  name: string;
  description: string;
  email: string;
  contact: string;
}): Promise<RazorpayPaymentResponse> {
  if (IS_PLACEHOLDER_KEY) {
    return simulateRazorpayCheckout(options);
  }

  await loadRazorpayScript();

  const Razorpay = (window as any).Razorpay;
  if (!Razorpay) {
    throw new Error("Razorpay is not available. Please check your network connection.");
  }

  return new Promise<RazorpayPaymentResponse>((resolve, reject) => {
    const amountInPaise = Math.round(options.amount * 100);

    const paymentWindow = new Razorpay({
      key: RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: "INR",
      name: "Kongsi",
      description: options.description,
      image: "https://cdn.kongsi.tea/logo.png",
      prefill: {
        name: options.name,
        email: options.email,
        contact: options.contact,
      },
      theme: {
        color: "#C08552",
      },
      handler(response: RazorpayPaymentResponse) {
        resolve(response);
      },
      modal: {
        ondismiss() {
          reject(new Error("Payment was cancelled. Please try again."));
        },
      },
    });

    if (typeof paymentWindow.on === "function") {
      paymentWindow.on("payment.failed", (failureResponse: any) => {
        reject(new Error(failureResponse.error?.description || "Payment failed. Please try again."));
      });
    }

    paymentWindow.open();
  });
}
