import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Calendar,
    Ticket,
    MapPin,
    Bus,
    Clock,
    CheckCircle2,
    AlertCircle,
    Phone,
    Briefcase
} from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellingBooking, setCancellingBooking] = useState(null);
    const [selectedSeatsForCancel, setSelectedSeatsForCancel] = useState([]);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelIssueType, setCancelIssueType] = useState("Cancellation");

    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
    const [changingPassword, setChangingPassword] = useState(false);

    const [printingBooking, setPrintingBooking] = useState(null);

    const handlePrintTicket = (booking) => {
        setPrintingBooking(booking);
        setTimeout(() => {
            window.print();
            setPrintingBooking(null);
        }, 100);
    };


    const fetchUserData = async () => {
        setLoading(true);
        try {
            const [profileRes, bookingsRes] = await Promise.all([
                api.get('/users/profile'),
                user?.role === 'customer' ? api.get('/users/my-bookings') : Promise.resolve({ data: [] })
            ]);
            setProfile(profileRes.data);
            setBookings(bookingsRes.data);
        } catch (err) {
            console.error("Profile Fetch Error:", err);
            setError("Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchUserData();
    }, []);

    const openCancelModal = (booking) => {
        setCancellingBooking(booking);
        const ids = booking.booking_list.split(',').map(id => id.trim());
        const seatNums = booking.seatnumbers.split(',').map(s => s.trim());

        // Map ID to Seat Number for selection
        const seatOptions = ids.map((id, index) => ({ id, seat: seatNums[index] }));
        setCancellingBooking({ ...booking, seatOptions });
        setSelectedSeatsForCancel(ids); // Select all by default
        setShowCancelModal(true);
    };

    const handleConfirmCancel = async () => {
        if (selectedSeatsForCancel.length === 0) {
            alert("Please select at least one seat to cancel.");
            return;
        }

        setActionLoading(cancellingBooking.booking_list);
        try {
            await Promise.all(selectedSeatsForCancel.map(id =>
                api.post('/bookings/cancel', {
                    bookingId: id,
                    reason: cancelReason,
                    issueType: cancelIssueType
                })
            ));
            alert("Cancellation request processed.");
            setShowCancelModal(false);
            setCancelReason("");
            fetchUserData();
        } catch (err) {
            console.error("Cancellation Error:", err);
            alert(err.response?.data?.error || "Failed to cancel.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setChangingPassword(true);
        try {
            await api.put('/users/change-password', passwords);
            alert('Password changed successfully');
            setPasswords({ currentPassword: '', newPassword: '' });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('WARNING: This action is irreversible. Are you sure you want to delete your account?')) return;
        try {
            await api.delete('/users/account');
            alert('Account deleted successfully');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete account');
        }
    };

    if (loading) return (
        // ... existing loading ...
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium tracking-wide">Loading your world...</p>
        </div>
    );

    if (error) return (
        // ... existing error ...
        <div className="max-w-xl mx-auto mt-20 p-12 bg-white rounded-3xl border border-red-50 text-center shadow-xl">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-8">{error}</p>
        </div>
    );

    return (
        <div className="relative min-h-screen">
            {/* Print UI - Visible ONLY on Print */}
            {printingBooking && (
                <div className="hidden print:block absolute top-0 left-0 w-full bg-white p-12 text-black font-sans z-[9999]">
                    <div className="border-[6px] border-gray-900 rounded-[3rem] p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-100 rounded-bl-[100%] -z-10 opacity-50"></div>
                        <div className="flex justify-between items-end border-b-4 border-dashed border-gray-300 pb-10 mb-10">
                            <div>
                                <h1 className="text-6xl font-black tracking-tighter text-gray-900 mb-2">TripSync</h1>
                                <p className="text-xl font-bold text-gray-500 tracking-[0.3em] uppercase">E-Ticket</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Booking Ref</p>
                                <p className="text-3xl font-black font-mono">#{printingBooking.booking_list.split(',')[0].trim()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-16 mb-12">
                            <div className="space-y-8">
                                <div>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Passenger Route</p>
                                    <h2 className="text-4xl font-black text-gray-900">{printingBooking.startpoint} <span className="text-gray-300 mx-2">→</span> {printingBooking.endpoint}</h2>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Date & Time</p>
                                    <p className="text-2xl font-bold text-gray-900">{new Date(printingBooking.tripdate).toLocaleDateString()} at {printingBooking.departuretime}</p>
                                </div>
                            </div>
                            <div className="space-y-8 border-l-4 border-gray-100 pl-16">
                                <div>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Operator Info</p>
                                    <p className="text-2xl font-bold text-gray-900">{printingBooking.companyname || 'TripSync Operator'} - {printingBooking.bustype} Class</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Assigned Seats</p>
                                    <p className="text-4xl font-black text-gray-900 tracking-wider">
                                        {printingBooking.seatnumbers}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-100 rounded-3xl p-8 flex justify-between items-center mt-12">
                            <div>
                                <p className="text-gray-500 font-bold tracking-widest uppercase text-sm mb-1">Total Amount Paid</p>
                                <p className="text-4xl font-black text-gray-900">৳{printingBooking.totalfare}</p>
                            </div>
                            <div className="w-32 h-32 bg-gray-300 rounded-xl flex flex-col items-center justify-center p-4">
                                <span className="font-bold text-center text-gray-500 uppercase tracking-widest text-[10px] leading-tight mt-1">Scan at Gate</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="print:hidden max-w-7xl mx-auto px-4 py-12">
                {/* Cancellation Modal */}
                {showCancelModal && cancellingBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
                            <div className="flex justify-between items-start">
                                <h3 className="text-2xl font-black text-gray-900">Cancel Booking</h3>
                                <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm text-gray-500 font-medium">Select seats to cancel (Partial Cancellation enabled):</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {cancellingBooking.seatOptions.map(opt => (
                                        <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedSeatsForCancel.includes(opt.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-100 text-gray-400'
                                            }`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedSeatsForCancel.includes(opt.id)}
                                                onChange={() => {
                                                    setSelectedSeatsForCancel(prev =>
                                                        prev.includes(opt.id) ? prev.filter(i => i !== opt.id) : [...prev, opt.id]
                                                    );
                                                }}
                                            />
                                            <span className="font-bold text-lg">{opt.seat}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Reason for Cancellation</label>
                                    <select
                                        className="w-full bg-gray-50 border-gray-100 rounded-xl p-3 font-semibold focus:ring-2 focus:ring-indigo-100 transition-all"
                                        value={cancelIssueType}
                                        onChange={(e) => setCancelIssueType(e.target.value)}
                                    >
                                        <option value="Cancellation">Trip Plan Changed</option>
                                        <option value="Billing Issue">Double Billing / Error</option>
                                        <option value="Complaint">Bad Service / Bus Conditions</option>
                                        <option value="Other">Other Reason</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Detail Description</label>
                                    <textarea
                                        className="w-full bg-gray-50 border-gray-100 rounded-xl p-3 h-24 font-medium focus:ring-2 focus:ring-indigo-100 transition-all"
                                        placeholder="Please tell us why you are cancelling..."
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Nevermind
                                </button>
                                <button
                                    onClick={handleConfirmCancel}
                                    disabled={actionLoading}
                                    className="flex-2 py-3 bg-rose-500 text-white font-black rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Archiving...' : 'Confirm Cancellation'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: User Info */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm sticky top-24">
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                                    <User size={48} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{profile?.name}</h2>
                                <p className="text-indigo-600 font-medium capitalize">{user?.role}</p>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Information</h3>

                                <div className="flex items-center gap-4 text-gray-700">
                                    <Mail size={20} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Email Address</p>
                                        <p className="font-medium">{profile?.email}</p>
                                    </div>
                                </div>

                                {profile?.phone && (
                                    <div className="flex items-center gap-4 text-gray-700">
                                        <Phone size={20} className="text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">Phone Number</p>
                                            <p className="font-medium">{profile?.phone}</p>
                                        </div>
                                    </div>
                                )}

                                {profile?.status && (
                                    <div className="flex items-center gap-4 text-gray-700">
                                        <Briefcase size={20} className="text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">Account Status</p>
                                            <p className={`font-bold ${profile.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}>{profile.status}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 text-gray-700">
                                    <Calendar size={20} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Joined On</p>
                                        <p className="font-medium">{profile?.joined ? new Date(profile.joined).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Account Settings</h3>

                                <form onSubmit={handleChangePassword} className="space-y-4 mb-8">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Current Password</label>
                                        <input type="password" required className="w-full mt-1 p-2 rounded-lg bg-gray-50 border border-gray-200 text-sm" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">New Password</label>
                                        <input type="password" required className="w-full mt-1 p-2 rounded-lg bg-gray-50 border border-gray-200 text-sm" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} />
                                    </div>
                                    <button type="submit" disabled={changingPassword} className="w-full text-xs font-bold bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
                                        {changingPassword ? 'Updating...' : 'Change Password'}
                                    </button>
                                </form>

                                <div className="pt-6 border-t border-rose-50">
                                    <h4 className="text-xs font-bold text-rose-500 mb-2">Danger Zone</h4>
                                    <button onClick={handleDeleteAccount} className="w-full text-xs font-bold bg-rose-50 text-rose-600 py-2 rounded-lg hover:bg-rose-100 transition-colors">
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Booking History */}
                    <div className="lg:col-span-8">
                        <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-4">
                            <Ticket size={32} className="text-indigo-600" />
                            {user?.role === 'customer' ? 'Your Bookings' : 'Quick Stats'}
                        </h2>

                        {user?.role === 'customer' ? (
                            <div className="space-y-6">
                                {bookings.length === 0 ? (
                                    <div className="bg-white rounded-3xl p-12 border border-dashed border-gray-200 text-center">
                                        <p className="text-gray-500 font-medium">No bookings found yet. Start your journey today!</p>
                                    </div>
                                ) : (
                                    bookings.map((booking) => (
                                        <div key={booking.booking_list} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:border-indigo-200 transition-all">
                                            <div className={`absolute top-0 right-0 w-2 h-full ${booking.status === 'Confirmed' ? 'bg-emerald-500' :
                                                booking.status === 'Pending' ? 'bg-amber-500' :
                                                    booking.status === 'RefundRequested' ? 'bg-rose-500' : 'bg-gray-300'
                                                }`}></div>

                                            <div className="flex-1 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Time: {new Date(booking.bookingtime).toLocaleTimeString()}</p>
                                                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                            {booking.startpoint} <span className="text-indigo-600">→</span> {booking.endpoint}
                                                        </h3>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' :
                                                            booking.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                                                                booking.status === 'RefundRequested' ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {booking.status}
                                                        </div>

                                                        {(booking.status === 'Confirmed' || booking.status === 'Pending') && (
                                                            <div className="flex flex-col items-end gap-2">
                                                                {booking.status === 'Pending' && (
                                                                    <button
                                                                        onClick={() => navigate('/payment', {
                                                                            state: {
                                                                                bookingIds: booking.booking_list.split(',').map(id => parseInt(id.trim())),
                                                                                trip: {
                                                                                    tripid: booking.tripid,
                                                                                    startpoint: booking.startpoint,
                                                                                    endpoint: booking.endpoint,
                                                                                    tripdate: booking.tripdate,
                                                                                    departuretime: booking.departuretime,
                                                                                    bustype: booking.bustype
                                                                                },
                                                                                selectedSeats: booking.seatnumbers.split(',').map(s => ({ seatnumber: s.trim() })),
                                                                                totalPrice: booking.totalfare
                                                                            }
                                                                        })}
                                                                        className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                                                    >
                                                                        Pay Now
                                                                    </button>
                                                                )}
                                                                {booking.status === 'Confirmed' && (
                                                                    <button
                                                                        onClick={() => handlePrintTicket(booking)}
                                                                        className="px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-1"
                                                                    >
                                                                        <Ticket size={12} /> Download PDF
                                                                    </button>
                                                                )}
                                                                <button
                                                                    disabled={actionLoading === booking.booking_list}
                                                                    onClick={() => openCancelModal(booking)}
                                                                    className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 underline decoration-rose-200 disabled:opacity-50"
                                                                >
                                                                    {actionLoading === booking.booking_list ? 'Processing...' : (booking.status === 'Pending' ? 'Cancel Seats' : 'Request Refund')}
                                                                </button>
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase">Date & Time</p>
                                                        <p className="text-sm font-bold flex items-center gap-1.5"><Calendar size={14} /> {new Date(booking.tripdate).toLocaleDateString()}</p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1.5"><Clock size={14} /> {booking.departuretime}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase">Bus & Seats</p>
                                                        <p className="text-sm font-bold flex items-center gap-1.5"><Bus size={14} /> {booking.busnumber}</p>
                                                        <p className="text-xs text-gray-500">Seats: <span className="font-bold">{booking.seatnumbers}</span> ({booking.bustype})</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase">Total Amount</p>
                                                        <p className="text-sm font-bold text-indigo-600">৳{booking.totalfare}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase">Booked On</p>
                                                        <p className="text-xs font-medium text-gray-500">{new Date(booking.bookingtime).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="bg-indigo-900 text-white rounded-3xl p-8 shadow-xl">
                                <h3 className="text-xl font-bold mb-4">Operator Overview</h3>
                                <p className="text-indigo-200 mb-8">Access your dashboard for full fleet and trip management.</p>
                                <button
                                    onClick={() => navigate('/operator')}
                                    className="bg-white text-indigo-900 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

