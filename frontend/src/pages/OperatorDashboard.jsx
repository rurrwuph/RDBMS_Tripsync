import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bus, Map, Settings, Plus, Users, ArrowUpRight, Calendar, ChevronRight } from 'lucide-react';
import axios from 'axios';

const OperatorDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [stats, setStats] = useState({
        totalBuses: 0,
        activeTrips: 0,
        todayBookings: 0,
        todayRevenue: 0
    });
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'operator') {
            navigate('/login');
            return;
        }

        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            try {
                const [statsRes, tripsRes] = await Promise.all([
                    axios.get('/api/trips/operator-stats', config),
                    axios.get('/api/trips/operator-trips', config)
                ]);
                setStats(statsRes.data);
                setTrips(tripsRes.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900">Operator Hub</h1>
                    <p className="text-gray-500 mt-2">Manage your fleet and schedules for <span className="text-indigo-600 font-bold">{user.name || 'Your Company'}</span></p>
                </div>
                <div className="flex gap-4">
                    <Link to="/operator/assign-trip" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200">
                        <Plus size={20} /> Add New Trip
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <Bus size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Buses</p>
                        <p className="text-2xl font-black text-gray-900">{stats.totalBuses}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Trips</p>
                        <p className="text-2xl font-black text-gray-900">{stats.activeTrips}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Bookings Today</p>
                        <p className="text-2xl font-black text-gray-900">{stats.todayBookings}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                        <Plus size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Revenue Today</p>
                        <p className="text-2xl font-black text-gray-900">৳{stats.todayRevenue.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h3 className="font-bold text-gray-900">Recent Trip Assignments</h3>
                            <Link to="/operator/trips" className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">
                                View All <ArrowUpRight size={14} />
                            </Link>
                        </div>
                        <div className="p-0">
                            {loading ? (
                                <div className="p-12 text-center text-gray-500">Loading trips...</div>
                            ) : trips.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">No trips assigned yet.</div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Bus</th>
                                            <th className="px-6 py-4">Route</th>
                                            <th className="px-6 py-4">Fare</th>
                                            <th className="px-6 py-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {trips.map(trip => (
                                            <tr key={trip.tripid} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 text-xs font-bold">{trip.bustype}</div>
                                                        <span className="font-semibold text-gray-700">{trip.busnumber}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-gray-800">{trip.startpoint} → {trip.endpoint}</p>
                                                    <p className="text-xs text-gray-500">{new Date(trip.tripdate).toLocaleDateString()} at {trip.departuretime.slice(0, 5)}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-indigo-600">৳{trip.basefare}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="text-indigo-600 font-bold text-sm">Manage</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">Fleet Management</h3>
                            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Add new buses to your fleet or update existing bus details for AC/Non-AC types.</p>
                            <Link to="/operator/buses" className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                                Manage Fleet
                            </Link>
                        </div>
                        <Bus size={120} className="absolute -bottom-4 -right-8 text-indigo-500 opacity-20 group-hover:rotate-12 transition-transform duration-500" />
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-left flex items-center justify-between group transition-all">
                                <div className="flex items-center gap-3 font-semibold">
                                    <LayoutDashboard size={20} className="text-gray-400 group-hover:text-indigo-600" />
                                    View Analytics
                                </div>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-600" />
                            </button>
                            <button className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-left flex items-center justify-between group transition-all">
                                <div className="flex items-center gap-3 font-semibold">
                                    <Settings size={20} className="text-gray-400 group-hover:text-indigo-600" />
                                    Profile Settings
                                </div>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperatorDashboard;
