import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Bus, Clock, MapPin, Tag, ChevronRight, Filter, AlertCircle } from 'lucide-react';
import axios from 'axios';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');

    useEffect(() => {
        const fetchTrips = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/trips/search?start=${from}&end=${to}&date=${date}`);
                setTrips(response.data.trips || []);
                setError(null);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setTrips([]);
                    setError(null);
                } else {
                    setError("Failed to fetch trips. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (from && to && date) {
            fetchTrips();
        } else {
            setLoading(false);
        }
    }, [from, to, date]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Available Buses</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <span className="font-semibold text-indigo-600">{from}</span>
                        <ChevronRight size={16} />
                        <span className="font-semibold text-indigo-600">{to}</span>
                        <span className="mx-2">|</span>
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-all font-medium">
                        <Filter size={18} /> Sort & Filter
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Finding best rides for you...</p>
                </div>
            ) : error ? (
                <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800">Something went wrong</h3>
                    <p className="text-gray-600">{error}</p>
                </div>
            ) : trips.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
                    <Bus size={64} className="mx-auto text-gray-300 mb-6" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No Buses Found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">We couldn't find any trips for this route and date. Try searching for Dhaka to Chittagong on 2026-02-01.</p>
                    <Link to="/" className="mt-8 inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
                        Back to Search
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {trips.map((trip) => (
                        <div key={trip.tripid} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-8 items-center group">
                            <div className="flex-shrink-0 w-24 h-24 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Bus size={40} />
                            </div>

                            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-gray-900">{trip.companyname}</h4>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Tag size={14} /> {trip.bustype} Class
                                    </p>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-gray-900">{trip.departuretime.slice(0, 5)}</p>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Departure</p>
                                    </div>
                                    <div className="flex-grow h-px bg-gray-200 relative">
                                        <div className="absolute -top-1.5 left-1/2 -ml-1.5 w-3 h-3 rounded-full border-2 border-indigo-600 bg-white"></div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-gray-900">--:--</p>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Arrival</p>
                                    </div>
                                </div>

                                <div className="text-right flex flex-col justify-center items-end">
                                    <p className="text-3xl font-black text-indigo-600">৳{trip.basefare}</p>
                                    <p className="text-sm text-gray-500">per seat</p>
                                </div>
                            </div>

                            <div className="flex-shrink-0 w-full md:w-auto">
                                <Link
                                    to={`/booking/${trip.tripid}`}
                                    className="block text-center bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-600 transition-all"
                                >
                                    View Seats
                                </Link>
                                <p className="text-center mt-2 text-xs text-emerald-600 font-bold">Available</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResults;
