import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    CreditCard,
    ShieldCheck,
    Wallet,
    Smartphone,
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    Truck,
    Clock,
    Ticket
} from 'lucide-react';
import api from '../utils/api';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingIds, trip, selectedSeats, totalPrice } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    // If no data is passed, redirect back to home or show error
    useEffect(() => {
        if (!bookingIds || !trip) {
            // Check if there are pending bookings or redirect
            // For now, redirecting
            // navigate('/');
        }
    }, [bookingIds, trip, navigate]);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);
        try {
            const methodLabel = paymentMethod === 'card' ? 'Credit Card' :
                paymentMethod === 'bkash' ? 'bKash' : 'Nagad';

            await api.post('/payment/process', {
                bookingIds: bookingIds,
                amount: totalPrice,
                paymentMethod: methodLabel
            });

            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || "Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) return (
        <div className="max-w-xl mx-auto mt-20 p-12 bg-white rounded-3xl border border-emerald-50 text-center shadow-2xl animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={56} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Payment Confirmed!</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
                Your journey from <span className="font-bold">{trip?.startpoint}</span> to <span className="font-bold">{trip?.endpoint}</span> is all set! We've sent the tickets to your email.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="font-mono font-bold text-gray-900">#TS-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount Paid</span>
                    <span className="font-bold text-emerald-600">৳{totalPrice}</span>
                </div>
            </div>
            <button onClick={() => navigate('/')} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-indigo-600 transition-all">
                Return to Home
            </button>
        </div>
    );

    if (!bookingIds || (Array.isArray(bookingIds) && bookingIds.length === 0)) return (
        <div className="max-w-xl mx-auto mt-20 p-12 bg-white rounded-3xl border border-gray-100 text-center shadow-xl">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Booking Found</h2>
            <p className="text-gray-600 mb-8">It seems you haven't selected any seats yet or your session expired.</p>
            <button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
                Search Trips
            </button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold mb-8 transition-colors"
            >
                <ChevronLeft size={20} /> Back to Booking
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <ShieldCheck size={28} className="text-emerald-500" />
                            Secure Payment
                        </h2>

                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Select Payment Method</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-100 hover:border-indigo-200'}`}
                                >
                                    <div className={`p-3 rounded-xl ${paymentMethod === 'card' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <CreditCard size={24} />
                                    </div>
                                    <span className={`font-bold text-sm ${paymentMethod === 'card' ? 'text-indigo-900' : 'text-gray-500'}`}>Card / Netubanking</span>
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('bkash')}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50/30' : 'border-gray-100 hover:border-pink-200'}`}
                                >
                                    <div className={`p-3 rounded-xl ${paymentMethod === 'bkash' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <Smartphone size={24} />
                                    </div>
                                    <span className={`font-bold text-sm ${paymentMethod === 'bkash' ? 'text-pink-900' : 'text-gray-500'}`}>bKash</span>
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('nagad')}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50/30' : 'border-gray-100 hover:border-orange-200'}`}
                                >
                                    <div className={`p-3 rounded-xl ${paymentMethod === 'nagad' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <Wallet size={24} />
                                    </div>
                                    <span className={`font-bold text-sm ${paymentMethod === 'nagad' ? 'text-orange-900' : 'text-gray-500'}`}>Nagad</span>
                                </button>
                            </div>

                            {paymentMethod === 'card' && (
                                <div className="mt-8 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Card Number</label>
                                            <input type="text" placeholder="●●●● ●●●● ●●●● ●●●●" className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Card Holder</label>
                                            <input type="text" placeholder="John Doe" className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Expiry Date</label>
                                            <input type="text" placeholder="MM/YY" className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">CVV</label>
                                            <input type="text" placeholder="●●●" className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                                <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-bottom-2 duration-300">
                                    <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                                        <Smartphone size={16} className="text-gray-400" />
                                        Enter your mobile number to receive an OTP
                                    </p>
                                    <input type="text" placeholder="01XXXXXXXXX" className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold tracking-widest" />
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                                    <AlertCircle size={20} />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="bg-indigo-900 text-white rounded-3xl p-8 shadow-xl sticky top-24">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                            <Ticket size={20} /> Trip Summary
                        </h3>

                        <div className="space-y-6 mb-10">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-800 flex items-center justify-center shrink-0">
                                    <Truck size={20} className="text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{trip?.startpoint} → {trip?.endpoint}</p>
                                    <p className="text-xs text-indigo-300">{trip?.bustype} Operator</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-800 flex items-center justify-center shrink-0">
                                    <Clock size={20} className="text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{new Date(trip?.tripdate).toLocaleDateString()} at {trip?.departuretime}</p>
                                    <p className="text-xs text-indigo-300">Departure scheduled</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-indigo-700/50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-indigo-200">Seats ({selectedSeats?.length})</span>
                                    <span className="font-bold">{selectedSeats?.map(s => s.seatnumber).join(', ')}</span>
                                </div>
                                <div className="flex justify-between items-center text-2xl font-black mt-4">
                                    <span>Total</span>
                                    <span>৳{totalPrice}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-2xl ${loading ? 'bg-indigo-800 text-indigo-400 cursor-not-allowed' : 'bg-white text-indigo-900 hover:bg-emerald-50 hover:text-emerald-700 hover:-translate-y-1'}`}
                        >
                            {loading ? (
                                <span className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-900 rounded-full animate-spin" />
                            ) : (
                                <>Pay ৳{totalPrice} Now</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
