import { TDLProduct, User } from '../types';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

export const openCheckout = async (
    product: TDLProduct,
    user: User,
    onSuccess: (paymentId: string) => void,
    onFailure: (error: any) => void
) => {
    const res = await loadRazorpay();

    if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
    }

    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    console.log("Initializing Razorpay with Key:", key ? "Key Found" : "Key Missing");

    if (!key) {
        alert("Razorpay Key ID is missing! Check .env file.");
        return;
    }

    const options = {
        key: key,
        amount: product.price * 100,
        currency: "INR",
        name: "TallyPro Solutions",
        description: `Purchase ${product.name}`,
        image: "https://example.com/your_logo",
        handler: function (response: any) {
            console.log("Payment Success:", response);
            onSuccess(response.razorpay_payment_id);
        },
        prefill: {
            name: user.name,
            email: user.email,
            contact: ""
        },
        notes: {
            address: "TallyPro Corporate Office"
        },
        theme: {
            color: "#3399cc"
        },
        modal: {
            ondismiss: function () {
                console.log("Checkout modal closed");
            }
        }
    };

    try {
        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response: any) {
            console.error("Payment Failed Event:", response.error);
            onFailure(response.error);
        });
        console.log("Opening Razorpay Checkout...");
        paymentObject.open();
    } catch (err) {
        console.error("Error creating Razorpay instance:", err);
        alert("Failed to open payment gateway. Check console.");
    }
};
