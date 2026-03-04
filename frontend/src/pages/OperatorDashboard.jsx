import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bus, Map, Settings, Plus, Users, ArrowUpRight, Calendar, ChevronRight, Maximize2, Minimize2, Edit, Trash2, MessageSquare, BarChart2, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const OperatorDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [stats, setStats] = useState({
        totalBuses: 0,
        activeTrips: 0,
        todayBookings: 0,
        todayRevenue: 0
    });
    const [activeTrips, setActiveTrips] = useState([]);
    const [pastTrips, setPastTrips] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isPastTripsExpanded, setIsPastTripsExpanded] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [showComplaints, setShowComplaints] = useState(false);
    const [complaintsData, setComplaintsData] = useState([]);
    const [editingTrip, setEditingTrip] = useState(null);

    const fetchDashboardData = async () => {
        if (!user) return;
        try {
            const [statsRes, activeTripsRes, pastTripsRes, refundsRes] = await Promise.all([
                api.get('/trips/operator-stats'),
                api.get('/trips/operator-trips'),
                api.get('/trips/operator-past-trips'),
                api.get('/bookings/operator/refund-requests')
            ]);
            setStats(statsRes.data);
            setActiveTrips(activeTripsRes.data);
            setPastTrips(pastTripsRes.data);
            setPendingRequests(refundsRes.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };
    // ... handleRefundAction and useEffect ...
    const handleRefundAction = async (refundId, decision) => {
        if (!window.confirm(`Are you sure you want to ${decision.toLowerCase()} this refund?`)) return;
        try {
            await api.post('/bookings/operator/process-refund', { refundId, decision });
            alert(`Refund ${decision.toLowerCase()} successfully.`);
            fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to process refund.");
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/trips/operator-analytics');
            setAnalyticsData(res.data);
            setShowAnalytics(true);
        } catch (err) { alert('Failed to fetch analytics'); }
    };

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/users/operator/complaints');
            setComplaintsData(res.data);
            setShowComplaints(true);
        } catch (err) { alert('Failed to fetch complaints'); }
    };

    const handleDeleteTrip = async (id) => {
        if (!window.confirm('Are you sure you want to delete this trip?')) return;
        try {
            await api.delete(`/trips/${id}`);
            alert('Trip deleted');
            fetchDashboardData();
        } catch (err) { alert(err.response?.data?.error || 'Failed to delete trip'); }
    };

    const handleUpdateTrip = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/trips/${editingTrip.tripid}`, {
                tripDate: editingTrip.tripDate,
                departureTime: editingTrip.departureTime,
                baseFare: editingTrip.baseFare
            });
            alert('Trip updated');
            setEditingTrip(null);
            fetchDashboardData();
        } catch (err) { alert(err.response?.data?.error || 'Failed to update trip'); }
    };

    const handleResolveComplaint = async (id) => {
        const action = prompt('Enter resolution details:');
        if (!action) return;
        try {
            await api.put(`/users/operator/complaints/${id}/status`, { status: 'Resolved', actionDescription: action });
            alert('Complaint resolved');
            fetchComplaints(); // refresh
        } catch (err) { alert('Failed to update complaint'); }
    };

    useEffect(() => {
        if (!user || user.role !== 'operator') {
            navigate('/login');
            return;
        }
        fetchDashboardData();
    }, [navigate]);

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Analytics Modal */}
            {showAnalytics && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2"><BarChart2 className="text-indigo-600" /> Revenue Analytics (CUBE)</h2>
                            <button onClick={() => setShowAnalytics(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 font-bold text-gray-600">
                                <tr>
                                    <th className="p-3 rounded-tl-xl">Date</th>
                                    <th className="p-3">Route</th>
                                    <th className="p-3">Bookings</th>
                                    <th className="p-3 rounded-tr-xl">Revenue (৳)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {analyticsData.map((row, i) => (
                                    <tr key={i} className={!row.trip_date && !row.route_id ? "bg-indigo-50 font-black" : (!row.trip_date || !row.route_id) ? "bg-gray-50/80 font-bold" : ""}>
                                        <td className="p-3">{row.trip_date ? new Date(row.trip_date).toLocaleDateString() : 'ALL DATES'}</td>
                                        <td className="p-3">{row.route_id ? `${row.start_point} → ${row.end_point}` : 'ALL ROUTES'}</td>
                                        <td className="p-3 text-indigo-600">{row.total_bookings}</td>
                                        <td className="p-3 text-emerald-600">৳{row.total_revenue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Complaints Modal */}
            {showComplaints && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2"><MessageSquare className="text-rose-500" /> Complaints Dashboard</h2>
                            <button onClick={() => setShowComplaints(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <div className="space-y-4">
                            {complaintsData.length === 0 ? <p className="text-gray-500">No complaints found.</p> : complaintsData.map(c => (
                                <div key={c.complaintid} className="p-4 border border-gray-100 rounded-2xl bg-gray-50 flex flex-col gap-2">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-gray-900">{c.customername} <span className="text-gray-400 text-xs font-normal ml-2">Booking #{c.bookingid} | {c.startpoint}→{c.endpoint}</span></span>
                                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wider ${c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span>
                                    </div>
                                    <p className="font-bold text-rose-500 text-sm">{c.issuetype}</p>
                                    <p className="text-gray-600 text-sm italic">{c.description}</p>
                                    {c.status !== 'Resolved' && (
                                        <button onClick={() => handleResolveComplaint(c.complaintid)} className="self-end text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-700"><CheckCircle2 size={14} /> Resolve</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Trip Modal */}
            {editingTrip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Edit className="text-indigo-600" /> Edit Trip Fare/Time</h2>
                            <button onClick={() => setEditingTrip(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleUpdateTrip} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Trip Date</label>
                                <input type="date" required className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200" value={editingTrip.tripDate ? new Date(editingTrip.tripDate).toISOString().split('T')[0] : ''} onChange={(e) => setEditingTrip({ ...editingTrip, tripDate: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Departure Time</label>
                                <input type="time" required className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200" value={editingTrip.departureTime || ''} onChange={(e) => setEditingTrip({ ...editingTrip, departureTime: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Base Fare (৳)</label>
                                <input type="number" required className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200" value={editingTrip.baseFare || ''} onChange={(e) => setEditingTrip({ ...editingTrip, baseFare: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl mt-4 hover:bg-indigo-700">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}

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
                        <p className="text-2xl font-black text-gray-900">{stats.todayBookings || 0}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                        <Plus size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Revenue Today</p>
                        <p className="text-2xl font-black text-gray-900">৳{stats.todayRevenue ? stats.todayRevenue.toLocaleString() : 0}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-12">
                    {/* Active Trips */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h3 className="font-bold text-gray-900">Active Trip Assignments</h3>
                            <Link to="/operator/trips" className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">
                                View All <ArrowUpRight size={14} />
                            </Link>
                        </div>
                        <div className="p-0">
                            {loading ? (
                                <div className="p-12 text-center text-gray-500">Loading trips...</div>
                            ) : activeTrips.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">No active trips.</div>
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
                                        {activeTrips.map(trip => (
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
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => setEditingTrip({
                                                            tripid: trip.tripid,
                                                            tripDate: trip.tripdate,
                                                            departureTime: trip.departuretime,
                                                            baseFare: trip.basefare
                                                        })} className="text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-lg hover:bg-indigo-50" title="Edit Trip"><Edit size={16} /></button>
                                                        <button onClick={() => handleDeleteTrip(trip.tripid)} className="text-rose-500 hover:text-rose-700 transition-colors p-2 rounded-lg hover:bg-rose-50" title="Delete Trip"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Past Trips Log */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h3 className="font-bold text-gray-500 flex items-center gap-2">
                                <LayoutDashboard size={18} className="text-gray-400" /> Past Trips (Archived)
                            </h3>
                            <button onClick={() => setIsPastTripsExpanded(!isPastTripsExpanded)} className="text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-gray-100">
                                {isPastTripsExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                            </button>
                        </div>
                        {isPastTripsExpanded && (
                            <div className="p-0">
                                {loading ? (
                                    <div className="p-12 text-center text-gray-500">Loading history...</div>
                                ) : pastTrips.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400">No past trips recorded.</div>
                                ) : (
                                    <table className="w-full text-left opacity-75">
                                        <thead className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Bus</th>
                                                <th className="px-6 py-4">Route</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {pastTrips.map(trip => (
                                                <tr key={trip.tripid} className="bg-gray-50/20">
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold text-gray-500">{trip.busnumber}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-bold text-gray-400">{trip.startpoint} → {trip.endpoint}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs text-gray-500">{new Date(trip.tripdate).toLocaleDateString()}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-md uppercase tracking-wider">Completed</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pending Refunds */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-rose-50/30">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Plus size={18} className="text-rose-500" /> Pending Refund Requests
                            </h3>
                        </div>
                        <div className="p-0">
                            {loading ? (
                                <div className="p-12 text-center text-gray-500">Loading requests...</div>
                            ) : pendingRequests.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">No pending refund requests.</div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Customer</th>
                                            <th className="px-6 py-4">Trip Info</th>
                                            <th className="px-6 py-4">Reason</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Decision</th>
                                        </tr>

                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {pendingRequests.filter(r => r.refundstatus === 'Pending').map(req => (
                                            <tr key={req.refundid} className="hover:bg-rose-50/10 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-900">{req.customername}</p>
                                                    <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase">ID: {req.bookingid}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold">{req.startpoint} → {req.endpoint}</p>
                                                    <p className="text-xs text-gray-500">{new Date(req.tripdate).toLocaleDateString()} Seat: {req.seatnumber}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-black text-rose-500 uppercase tracking-tighter">{req.issuetype || 'Cancellation'}</p>
                                                    <p className="text-sm font-medium text-gray-600 line-clamp-2 max-w-[200px]" title={req.reason}>{req.reason || 'No description provided'}</p>
                                                </td>
                                                <td className="px-6 py-4 font-black text-rose-600">৳{req.amount}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleRefundAction(req.refundid, 'Approved')}
                                                            className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-all"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRefundAction(req.refundid, 'Rejected')}
                                                            className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
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
                            <button onClick={fetchAnalytics} className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-left flex items-center justify-between group transition-all">
                                <div className="flex items-center gap-3 font-semibold">
                                    <BarChart2 size={20} className="text-gray-400 group-hover:text-indigo-600" />
                                    View Analytics
                                </div>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-600" />
                            </button>
                            <button onClick={fetchComplaints} className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-rose-50 hover:text-rose-600 text-left flex items-center justify-between group transition-all">
                                <div className="flex items-center gap-3 font-semibold">
                                    <MessageSquare size={20} className="text-gray-400 group-hover:text-rose-600" />
                                    Complaint Dashboard
                                </div>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-rose-600" />
                            </button>
                            <Link to="/profile" className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-left flex items-center justify-between group transition-all">
                                <div className="flex items-center gap-3 font-semibold">
                                    <Settings size={20} className="text-gray-400 group-hover:text-indigo-600" />
                                    Profile Settings
                                </div>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-600" />
                            </Link>
                            <button onClick={fetchComplaints} className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-rose-50 hover:text-rose-600 text-left flex items-center justify-between group transition-all">
                                <div className="flex items-center gap-3 font-semibold">
                                    <MessageSquare size={20} className="text-gray-400 group-hover:text-rose-600" />
                                    Complaint Dashboard
                                </div>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-rose-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperatorDashboard;
