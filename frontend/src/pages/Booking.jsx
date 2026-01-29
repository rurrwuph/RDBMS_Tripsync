import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Armchair, ChevronLeft, CreditCard, Info, MapPin } from 'lucide-react';

const Booking = () => {
    const navigate = useNavigate();
    const { tripId } = useParams();
    const [selectedSeats, setSelectedSeats] = useState([]);

    // Mock data for seats - in real app, fetch based on tripId
    const seats = Array.from({ length: 40 }, (_, i) => ({
        id: i + 1,
        number: `${String.fromCharCode(65 + Math.floor(i / 4))}${(i % 4) + 1}`,
        isBooked: Math.random() < 0.2, // 20% seats booked
        type: (i % 4 === 0 || i % 4 === 3) ? 'Window' : 'Aisle'
    }));

    const toggleSeat = (seat) => {
        if (seat.isBooked) return;
        if (selectedSeats.find(s => s.id === seat.id)) {
            setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
        } else {
            if (selectedSeats.length >= 4) {
                alert("You can select up to 4 seats only.");
                return;
            }
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const basePrice = 850; // Mock price
    const totalPrice = selectedSeats.length * basePrice;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold mb-8 transition-colors"
            >
                <ChevronLeft size={20} /> Back to Results
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Seat Map */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <Armchair size={28} className="text-indigo-600" />
                            Select Your Preferred Seats
                        </h2>

                        <div className="relative bg-gray-50 rounded-2xl p-6 md:p-12 mb-8 border border-gray-100">
                            {/* Driver Section */}
                            <div className="flex justify-between items-center mb-12 pb-6 border-b border-gray-200">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Front of Bus</div>
                                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                    <Info size={20} />
                                </div>
                            </div>

                            {/* Seats Grid */}
                            <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-sm mx-auto">
                                {seats.map((seat) => (
                                    <button
                                        key={seat.id}
                                        disabled={seat.isBooked}
                                        onClick={() => toggleSeat(seat)}
                                        className={`
                      relative group w-full aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-300 transform
                      ${seat.isBooked ? 'bg-gray-100 text-gray-300 cursor-not-allowed' :
                                                selectedSeats.find(s => s.id === seat.id) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 -translate-y-1' :
                                                    'bg-white text-gray-500 border border-gray-200 hover:border-indigo-400 hover:text-indigo-600 hover:-translate-y-1'}
                    `}
                                    >
                                        <Armchair size={24} className={seat.isBooked ? 'opacity-20' : ''} />
                                        <span className="text-[10px] font-bold mt-1">{seat.number}</span>
                                        {seat.type === 'Window' && !seat.isBooked && (
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-sky-400 rounded-full border border-white"></div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="mt-12 flex flex-wrap justify-center gap-6 pt-8 border-t border-gray-100 text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-white border border-gray-200"></div>
                                    <span className="text-gray-500">Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-indigo-600"></div>
                                    <span className="text-gray-900">Selected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-gray-100 italic border border-gray-200"></div>
                                    <span className="text-gray-400">Booked</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Summary */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm sticky top-24">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Fare Summary</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-gray-600">
                                <span>Selected Seats ({selectedSeats.length})</span>
                                <span className="font-bold text-gray-900">{selectedSeats.map(s => s.number).join(', ') || 'None'}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Base Fare</span>
                                <span className="font-medium">৳{basePrice} x {selectedSeats.length}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Estimated Total</p>
                                    <p className="text-3xl font-black text-indigo-600">৳{totalPrice}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={selectedSeats.length === 0}
                            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-lg disabled:opacity-50 disabled:pointer-events-none"
                        >
                            <CreditCard size={20} />
                            Proceed to Payment
                        </button>

                        <div className="mt-6 flex items-start gap-3 bg-amber-50 p-4 rounded-2xl">
                            <Info size={20} className="text-amber-600 shrink-0" />
                            <p className="text-xs text-amber-700 leading-relaxed">
                                Tickets are non-refundable after 1 hour of scheduled departure. Please review our <span className="underline font-bold">terms and conditions</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;
