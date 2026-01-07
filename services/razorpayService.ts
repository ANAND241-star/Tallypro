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

    const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: product.price * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: "TallyPro Solutions",
        description: `Purchase ${product.name}`,
        image: "https://example.com/your_logo", // You can replace this with your logo URL
        handler: function (response: any) {
            // Validate payment_id if needed on server
            onSuccess(response.razorpay_payment_id);
        },
        prefill: {
            name: user.name,
            email: user.email,
            contact: "" // Can be added if available in user object
        },
        notes: {
            address: "TallyPro Corporate Office"
        },
        theme: {
            color: "#3399cc"
        }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response: any) {
        onFailure(response.error);
    });
    paymentObject.open();
};
