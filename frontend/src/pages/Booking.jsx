import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Armchair, ChevronLeft, CreditCard, Info, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const Booking = () => {
    const navigate = useNavigate();
    const { tripId } = useParams();
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [seats, setSeats] = useState([]);
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tripRes, seatsRes] = await Promise.all([
                    axios.get(`/api/trips/${tripId}`),
                    axios.get(`/api/bookings/seats/${tripId}`)
                ]);
                setTrip(tripRes.data);
                setSeats(seatsRes.data);
                setError(null);
            } catch (err) {
                console.error("Booking Fetch Error:", err);
                setError("Failed to load trip details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (tripId) fetchData();
    }, [tripId]);

    const toggleSeat = (seat) => {
        if (seat.isbooked) return;
        if (selectedSeats.find(s => s.seatid === seat.seatid)) {
            setSelectedSeats(selectedSeats.filter(s => s.seatid !== seat.seatid));
        } else {
            if (selectedSeats.length >= 4) {
                alert("You can select up to 4 seats only.");
                return;
            }
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const handleBooking = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please login as a customer to book tickets.");
            navigate('/login');
            return;
        }

        setBookingLoading(true);
        try {
            for (const seat of selectedSeats) {
                await axios.post('/api/bookings/book',
                    { tripId: parseInt(tripId), seatId: seat.seatid },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            setBookingSuccess(true);
        } catch (err) {
            alert(err.response?.data?.error || "Booking failed.");
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium tracking-wide">Securing your journey...</p>
        </div>
    );

    if (error) return (
        <div className="max-w-xl mx-auto mt-20 p-12 bg-white rounded-3xl border border-red-50 text-center shadow-xl">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button onClick={() => navigate(-1)} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
                Go Back
            </button>
        </div>
    );

    if (bookingSuccess) return (
        <div className="max-w-xl mx-auto mt-20 p-12 bg-white rounded-3xl border border-emerald-50 text-center shadow-2xl animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
                Pack your bags! Your seats <span className="font-bold text-indigo-600">{selectedSeats.map(s => s.seatnumber).join(', ')}</span> have been successfully reserved for the trip to <span className="font-bold">{trip?.endpoint}</span>.
            </p>
            <button onClick={() => navigate('/')} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-indigo-600 transition-all">
                Return to Home
            </button>
        </div>
    );

    const basePrice = trip ? parseFloat(trip.basefare) : 0;
    const totalPrice = selectedSeats.length * basePrice;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold mb-8 transition-colors group"
            >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Results
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 z-0"></div>

                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                <Armchair size={28} className="text-indigo-600" />
                                Select Your Preferred Seats
                            </h2>
                            <p className="text-gray-500 mb-8 flex items-center gap-2">
                                <MapPin size={16} /> {trip?.startpoint} to {trip?.endpoint} | {trip?.bustype}
                            </p>

                            <div className="relative bg-gray-50 rounded-2xl p-6 md:p-12 mb-8 border border-gray-100">
                                <div className="flex justify-between items-center mb-12 pb-6 border-b border-gray-200">
                                    <div className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Front of Bus</div>
                                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                                        <Info size={20} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-sm mx-auto">
                                    {seats.map((seat) => (
                                        <button
                                            key={seat.seatid}
                                            disabled={seat.isbooked}
                                            onClick={() => toggleSeat(seat)}
                                            className={`
                                                relative group w-full aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-300 transform
                                                ${seat.isbooked ? 'bg-gray-100 text-gray-300 cursor-not-allowed border border-transparent' :
                                                    selectedSeats.find(s => s.seatid === seat.seatid) ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 -translate-y-1' :
                                                        'bg-white text-gray-500 border border-gray-200 hover:border-indigo-400 hover:text-indigo-600 hover:-translate-y-1 shadow-sm'}
                                            `}
                                        >
                                            <Armchair size={24} className={seat.isbooked ? 'opacity-20' : ''} />
                                            <span className="text-[10px] font-bold mt-1">{seat.seatnumber}</span>
                                            {seat.seattype === 'Window' && !seat.isbooked && (
                                                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-sky-400 rounded-full"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-12 flex flex-wrap justify-center gap-8 pt-10 border-t border-gray-100 text-xs font-bold uppercase tracking-widest">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-lg bg-white border border-gray-200 shadow-sm"></div>
                                        <span className="text-gray-500">Available</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-100"></div>
                                        <span className="text-gray-900">Selected</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-lg bg-gray-100 border border-gray-200"></div>
                                        <span className="text-gray-400">Reserved</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-indigo-900 text-white rounded-3xl p-8 shadow-xl sticky top-24">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                            <CreditCard size={20} /> Fare Summary
                        </h3>

                        <div className="space-y-5 mb-10">
                            <div className="flex justify-between items-center text-indigo-200">
                                <span className="text-sm font-medium">Selected Seats ({selectedSeats.length})</span>
                                <span className="font-bold text-white text-lg">{selectedSeats.map(s => s.seatnumber).join(', ') || '--'}</span>
                            </div>
                            <div className="flex justify-between items-center text-indigo-200">
                                <span className="text-sm font-medium">Ticket Price</span>
                                <span className="font-medium">৳{basePrice} × {selectedSeats.length}</span>
                            </div>
                            <div className="pt-6 border-t border-indigo-700/50 flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest mb-1">Total Payable</p>
                                    <p className="text-4xl font-black text-white">৳{totalPrice}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={selectedSeats.length === 0 || bookingLoading}
                            onClick={handleBooking}
                            className={`
                                w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-2xl
                                ${selectedSeats.length === 0 || bookingLoading ? 'bg-indigo-800 text-indigo-400 cursor-not-allowed' : 'bg-white text-indigo-900 hover:bg-indigo-50 hover:-translate-y-1'}
                            `}
                        >
                            {bookingLoading ? (
                                <span className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-900 rounded-full animate-spin" />
                            ) : (
                                <>
                                    Confirm Booking
                                    <ChevronLeft size={20} className="rotate-180" />
                                </>
                            )}
                        </button>

                        <div className="mt-8 flex items-start gap-3 bg-indigo-800/40 p-5 rounded-2xl border border-indigo-700/30">
                            <Info size={18} className="text-indigo-300 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-indigo-100 leading-relaxed opacity-80 font-medium">
                                By clicking confirm, you agree to our <span className="underline decoration-indigo-400">Service Agreement</span>. Safe travels!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;
