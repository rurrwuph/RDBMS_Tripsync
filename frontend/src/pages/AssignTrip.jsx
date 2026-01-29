import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Bus, ChevronLeft, Send, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AssignTrip = () => {
    const navigate = useNavigate();
    const [buses, setBuses] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        busId: '',
        routeId: '',
        tripDate: '',
        departureTime: '',
        fare: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [busRes, routeRes] = await Promise.all([
                    axios.get('/api/buses/operator-list', config),
                    axios.get('/api/trips/routes')
                ]);
                setBuses(busRes.data);
                setRoutes(routeRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post('/api/trips/assign', formData, config);
            setMessage({ type: 'success', text: 'Trip assigned successfully!' });
            setTimeout(() => navigate('/operator'), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to assign trip.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-12 text-center">Loading form details...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/operator" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold mb-8 transition-colors">
                <ChevronLeft size={20} /> Back to Dashboard
            </Link>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-indigo-600 p-8 text-white">
                    <h1 className="text-3xl font-black mb-2">Schedule New Trip</h1>
                    <p className="text-indigo-100 italic">Assign a bus to a route and set the departure details.</p>
                </div>

                <div className="p-8">
                    {message && (
                        <div className={`mb-8 p-4 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'} font-bold flex items-center gap-2`}>
                            {message.type === 'error' && <AlertTriangle size={20} />}
                            {message.text}
                        </div>
                    )}

                    {buses.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <Bus size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-700 mb-2">No Buses Available</h3>
                            <p className="text-gray-500 mb-6">You need to add a bus to your fleet before you can assign a trip.</p>
                            <Link to="/operator/buses" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
                                Go to Fleet Management
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                        <Bus size={18} className="text-indigo-600" /> Select Bus
                                    </label>
                                    <select
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold text-gray-700"
                                        value={formData.busId}
                                        onChange={e => setFormData({ ...formData, busId: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Choose a Bus --</option>
                                        {buses.map(bus => (
                                            <option key={bus.busid} value={bus.busid}>
                                                {bus.busnumber} ({bus.bustype})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-black text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                        <MapPin size={18} className="text-indigo-600" /> Select Route
                                    </label>
                                    <select
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold text-gray-700"
                                        value={formData.routeId}
                                        onChange={e => setFormData({ ...formData, routeId: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Choose a Route --</option>
                                        {routes.map(route => (
                                            <option key={route.routeid} value={route.routeid}>
                                                {route.startpoint} → {route.endpoint}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                        <Calendar size={18} className="text-indigo-600" /> Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold text-gray-700"
                                        value={formData.tripDate}
                                        onChange={e => setFormData({ ...formData, tripDate: e.target.value })}
                                        required min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-black text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                        <Clock size={18} className="text-indigo-600" /> Departure Time
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold text-gray-700"
                                        value={formData.departureTime}
                                        onChange={e => setFormData({ ...formData, departureTime: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-black text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                        ৳ Base Fare
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Price in BDT"
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold text-gray-700"
                                        value={formData.fare}
                                        onChange={e => setFormData({ ...formData, fare: e.target.value })}
                                        required min="100"
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    disabled={submitting}
                                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                                >
                                    <Send size={24} />
                                    {submitting ? 'Creating Assignment...' : 'Finalize & Schedule Trip'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignTrip;
