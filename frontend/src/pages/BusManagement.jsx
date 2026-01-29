import React, { useState, useEffect } from 'react';
import { Bus, Plus, ChevronLeft, Trash2, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BusManagement = () => {
    const navigate = useNavigate();
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        busNumber: '',
        busType: 'AC',
        totalSeats: 36
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchBuses = async () => {
        try {
            const res = await axios.get('/api/buses/operator-list', config);
            setBuses(res.data);
        } catch (err) {
            console.error('Error fetching buses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post('/api/buses/add', formData, config);
            setMessage({ type: 'success', text: 'Bus added successfully!' });
            setShowForm(false);
            setFormData({ busNumber: '', busType: 'AC', totalSeats: 36 });
            fetchBuses();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to add bus. Please try again.';
            setMessage({ type: 'error', text: errorMsg });
            console.error('Bus addition error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-10">
                <Link to="/operator" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold transition-colors">
                    <ChevronLeft size={20} /> Back to Dashboard
                </Link>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all"
                >
                    <Plus size={20} /> {showForm ? 'Cancel' : 'Add New Bus'}
                </button>
            </div>

            {message && (
                <div className={`mb-8 p-4 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'} font-bold`}>
                    {message.text}
                </div>
            )}

            {showForm && (
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h2 className="text-2xl font-black text-gray-900 mb-6">Register a New Bus</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600">Bus Number</label>
                            <input
                                type="text"
                                placeholder="e.g. DH-1234"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none focus:ring-2 focus:ring-indigo-200"
                                value={formData.busNumber}
                                onChange={e => setFormData({ ...formData, busNumber: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600">Bus Type</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none focus:ring-2 focus:ring-indigo-200"
                                value={formData.busType}
                                onChange={e => setFormData({ ...formData, busType: e.target.value })}
                            >
                                <option value="AC">AC</option>
                                <option value="Non-AC">Non-AC</option>
                                <option value="Sleeper">Sleeper</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600">Seats</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none focus:ring-2 focus:ring-indigo-200"
                                value={formData.totalSeats}
                                onChange={e => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
                                required min="10" max="60"
                            />
                        </div>
                        <button
                            disabled={submitting}
                            className="bg-gray-900 text-white p-4 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Registering...' : 'Complete Registration'}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                    <h3 className="font-bold text-gray-900">Your Fleet</h3>
                </div>
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading fleet...</div>
                ) : buses.length === 0 ? (
                    <div className="p-20 text-center">
                        <Bus size={64} className="mx-auto text-gray-200 mb-6" />
                        <h3 className="text-xl font-bold text-gray-400">No buses registered yet.</h3>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Bus ID</th>
                                <th className="px-6 py-4">Bus Number</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Total Seats</th>
                                <th className="px-4 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {buses.map(bus => (
                                <tr key={bus.busid} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-indigo-600">#{bus.busid}</td>
                                    <td className="px-6 py-4 font-bold text-gray-800">{bus.busnumber}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${bus.bustype === 'AC' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {bus.bustype}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-500">{bus.totalseats} Seats</td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs uppercase">
                                            <ShieldCheck size={14} /> Active
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default BusManagement;
