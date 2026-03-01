import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing parameters' });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET || '';

        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (digest !== razorpay_signature) {
            return res.status(400).json({ status: 'failure', message: 'Transaction not legit!' });
        }

        return res.status(200).json({ status: 'success', message: 'Payment verified successfully' });
    } catch (error: any) {
        console.error('Verify Payment Error:', error);
        return res.status(500).json({ error: error.message || 'Something went wrong verification' });
    }
}
