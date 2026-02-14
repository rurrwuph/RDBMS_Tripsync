import React, { useState } from 'react';
import axios from 'axios';

const Payment = () => {
    const [bookingIds, setBookingIds] = useState("");
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState("");

    const handlePayment = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setStatus("Please login first.");
            return;
        }

        try {
            const ids = bookingIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            const res = await axios.post('/api/payment/process', {
                bookingIds: ids,
                amount: parseFloat(amount),
                paymentMethod: 'Credit Card'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStatus(res.data.message || "Payment Successful");
        } catch (err) {
            setStatus("Error: " + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-20">
            <div className="bg-white p-10 rounded-xl shadow-lg border w-full max-w-md text-center">
                <h2 className="text-2xl font-bold mb-6">Payment</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Booking IDs (comma separated)"
                        className="w-full border rounded p-3 mb-3"
                        value={bookingIds}
                        onChange={e => setBookingIds(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        className="w-full border rounded p-3 mb-6"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                </div>
                <button
                    onClick={handlePayment}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition"
                >
                    Pay
                </button>
                {status && (
                    <div className="mt-4 p-3 bg-gray-50 rounded text-gray-700">
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payment;
