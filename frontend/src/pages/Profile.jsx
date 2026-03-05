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
    Briefcase,
    Trash2,
    ShieldCheck,
    Gift,
    Copy,
    ChevronRight
} from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const CountdownTimer = ({ bookingTime }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const booked = new Date(bookingTime);
            if (isNaN(booked)) return;

            const diff = 10 * 60 * 1000 - (now - booked);

            if (diff <= 0) {
                setTimeLeft("Expired");
                clearInterval(timer);
            } else {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [bookingTime]);

    if (timeLeft === "Expired") return <span className="text-rose-500 font-bold text-[10px] uppercase tracking-widest">Timed Out</span>;
    if (!timeLeft) return null;

    return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all duration-500 ${parseInt(timeLeft.split(':')[0]) < 2 ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
            <Clock size={10} strokeWidth={3} />
            <span className="font-black tabular-nums text-[10px] tracking-widest">{timeLeft}</span>
        </div>
    );
};

const BoardingCountdown = ({ tripDate, departureTime }) => {
    const [status, setStatus] = useState("");

    useEffect(() => {
        const calculateStatus = () => {
            const now = new Date();
            const trip = new Date(`${new Date(tripDate).toDateString()} ${departureTime}`);
            const diff = trip - now;

            if (diff < 0) {
                setStatus(Math.abs(diff) < 2 * 60 * 60 * 1000 ? "In Transit" : "Past Trip");
            } else if (diff < 2 * 60 * 60 * 1000) {
                setStatus("Boarding Soon");
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const days = Math.floor(hours / 24);
                if (days > 0) setStatus(`${days}d ${hours % 24}h to go`);
                else setStatus(`${hours}h to go`);
            }
        };
        calculateStatus();
        const timer = setInterval(calculateStatus, 60000);
        return () => clearInterval(timer);
    }, [tripDate, departureTime]);

    return (
        <div className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${status === 'Boarding Soon' ? 'bg-indigo-600 text-white animate-bounce' :
            status === 'In Transit' ? 'bg-emerald-500 text-white' :
                'text-gray-400 bg-gray-50'
            }`}>
            {status}
        </div>
    );
};

const BusFacilities = () => (
    <div className="flex gap-1.5">
        {[
            { icon: <Mail size={10} />, label: "WiFi" },
            { icon: <Clock size={10} />, label: "AC" },
            { icon: <Briefcase size={10} />, label: "Power" }
        ].map(f => (
            <div key={f.label} className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 text-gray-400 border border-gray-200" title={f.label}>
                {f.icon}
            </div>
        ))}
    </div>
);

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

        const seatOptions = ids.map((id, index) => ({ id, seat: seatNums[index] }));
        setCancellingBooking({ ...booking, seatOptions });
        setSelectedSeatsForCancel(ids);
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
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium tracking-wide">Loading your world...</p>
        </div>
    );

    if (error) return (
        <div className="max-w-xl mx-auto mt-20 p-12 bg-white rounded-3xl border border-red-50 text-center shadow-xl">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-8">{error}</p>
        </div>
    );

    return (
        <div className="relative min-h-screen bg-gray-50/50">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: A4; margin: 0; }
                    body { visibility: hidden; background: white !important; }
                    .print-ticket-container { 
                        visibility: visible !important;
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        display: flex !important;
                        align-items: flex-start !important;
                        justify-content: center !important;
                        background: white !important;
                        padding: 0 !important;
                    }
                    .print-ticket-card {
                        width: 190mm !important;
                        margin: 10mm auto !important;
                        border: 3px solid #000 !important;
                        border-radius: 20px !important;
                        padding: 30px !important;
                        box-shadow: none !important;
                        page-break-inside: avoid !important;
                    }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            ` }} />

            {/* Print Ticket Layout */}
            {printingBooking && (
                <div className="print-ticket-container hidden print:flex absolute top-0 left-0 w-full h-full bg-white p-12 text-black font-sans z-[9999]">
                    <div className="print-ticket-card border-[3px] border-black rounded-[2rem] p-10 bg-white shadow-none">
                        <div className="flex justify-between items-end border-b-2 border-dashed border-gray-300 pb-8 mb-8">
                            <div>
                                <h1 className="text-4xl font-black italic text-black">TripSync</h1>
                                <p className="text-xs font-bold uppercase tracking-[0.5em] text-gray-500">Boarding Pass</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Reference No.</p>
                                <p className="text-xl font-black font-mono">#{printingBooking.booking_list.split(',')[0].trim()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-10 mb-8">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400">Route</p>
                                    <h2 className="text-2xl font-black">{printingBooking.startpoint} → {printingBooking.endpoint}</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400">Date</p>
                                        <p className="text-lg font-bold">{new Date(printingBooking.tripdate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400">Time</p>
                                        <p className="text-lg font-bold">{printingBooking.departuretime}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6 border-l pl-10 border-gray-100">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400">Service</p>
                                    <p className="text-lg font-bold uppercase">{printingBooking.companyname || 'TripSync'} / {printingBooking.bustype}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400">Seats</p>
                                    <p className="text-4xl font-black tracking-tighter text-indigo-600">{printingBooking.seatnumbers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl flex justify-between items-center border border-gray-100">
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Total Amount Paid</p>
                                <p className="text-2xl font-black">৳{printingBooking.totalfare}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">Pass Issued On</p>
                                <p className="text-xs font-bold">{new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="print:hidden max-w-7xl mx-auto px-4 py-8 md:py-12">
                {/* Cancellation Modal Content stays largely same */}
                {showCancelModal && cancellingBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                        <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-10 opacity-50"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 leading-none">Modify Presence</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">Cancellation Request</p>
                                </div>
                                <button onClick={() => setShowCancelModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                                    &times;
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Selective Seats</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {cancellingBooking.seatOptions.map(opt => (
                                            <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${selectedSeatsForCancel.includes(opt.id) ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-lg shadow-indigo-100' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                                                <input type="checkbox" className="hidden" checked={selectedSeatsForCancel.includes(opt.id)}
                                                    onChange={() => setSelectedSeatsForCancel(prev => prev.includes(opt.id) ? prev.filter(i => i !== opt.id) : [...prev, opt.id])} />
                                                <span className="font-black text-lg">{opt.seat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inquiry Type</label>
                                    <select className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none rounded-2xl p-4 font-bold text-gray-700 transition-all appearance-none"
                                        value={cancelIssueType} onChange={(e) => setCancelIssueType(e.target.value)}>
                                        <option value="Cancellation">Trip Plan Changed</option>
                                        <option value="Billing Issue">Double Billing / Error</option>
                                        <option value="Complaint">Bad Service / Bus Conditions</option>
                                        <option value="Other">Other Reason</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Justification</label>
                                    <textarea className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none rounded-2xl p-4 h-24 font-bold text-gray-700 transition-all resize-none"
                                        placeholder="Briefly state your reason..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setShowCancelModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl transition-all">Abort</button>
                                    <button onClick={handleConfirmCancel} disabled={actionLoading} className="flex-[2] py-4 bg-rose-500 text-white font-black rounded-2xl shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all disabled:opacity-50">
                                        {actionLoading ? 'Processing...' : 'Proceed with Cancellation'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    {/* Left Column: User Info & Control Cards */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="sticky top-24 space-y-8">
                            {/* Profile Information Card */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
                                <div className="flex flex-col items-center text-center mb-10">
                                    <div className="w-28 h-28 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-indigo-100 rotate-3 hover:rotate-0 transition-transform duration-500">
                                        <User size={56} />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 leading-none">{profile?.name}</h2>
                                    <p className="mt-2 inline-block px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-indigo-200">
                                        {user?.role} Access
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-4">
                                        <span className="shrink-0 bg-gray-50 px-2">Account Dossier</span>
                                        <hr className="w-full border-gray-50" />
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4 text-gray-700">
                                            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400"><Mail size={20} /></div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Primary Email</p>
                                                <p className="font-bold text-gray-900">{profile?.email}</p>
                                            </div>
                                        </div>

                                        {profile?.phone && (
                                            <div className="flex items-start gap-4 text-gray-700">
                                                <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400"><Phone size={20} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Verified Phone</p>
                                                    <p className="font-bold text-gray-900">{profile?.phone}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-start gap-4 text-gray-700">
                                            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400"><Calendar size={20} /></div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Active Since</p>
                                                <p className="font-bold text-gray-900">{profile?.joined ? new Date(profile.joined).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reward Card - ONLY FOR CUSTOMERS */}
                                    {user?.role === 'customer' && (
                                        <div className="p-6 bg-indigo-900 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-indigo-100">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100%] group-hover:scale-150 transition-transform duration-1000"></div>
                                            <div className="relative z-10 flex flex-col gap-6">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Titanium Points</p>
                                                        <div className="flex items-baseline gap-1.5 mt-1">
                                                            <span className="text-4xl font-black tabular-nums tracking-tighter italic">105,750</span>
                                                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Pts</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                                        <Gift size={20} className="text-indigo-400" />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="w-full bg-indigo-950/50 h-2 rounded-full overflow-hidden border border-white/5">
                                                        <div className="bg-indigo-400 h-full w-[88%] rounded-full shadow-[0_0_15px_rgba(129,140,248,0.5)]"></div>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-sm">
                                                        <div>
                                                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Elite Code</p>
                                                            <p className="font-mono text-sm font-black text-white tracking-[0.2em]">LOYALTY-100K-XL</p>
                                                        </div>
                                                        <button
                                                            onClick={() => alert("Requirement: 150,000 Points needed for XL Redemption. Keep traveling to unlock!")}
                                                            className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center hover:bg-indigo-400 transition-colors"
                                                        >
                                                            <ChevronRight size={18} />
                                                        </button>
                                                    </div>
                                                    <p className="text-[9px] text-indigo-400/80 font-black uppercase tracking-widest text-center italic">
                                                        * Reveal Reward: 5% Base Fare Waiver (Up to ৳50)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Account Controls Card */}
                            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-lg shadow-gray-100 space-y-8">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                                    <ShieldCheck size={14} className="text-emerald-500" /> Security Matrix
                                </h3>

                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase">Legacy Passcode</label>
                                        <input type="password" required className="w-full p-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 outline-none font-bold text-sm transition-all"
                                            value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase">New Cipher</label>
                                        <input type="password" required className="w-full p-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 outline-none font-bold text-sm transition-all"
                                            value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} />
                                    </div>
                                    <button type="submit" disabled={changingPassword} className="w-full py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                                        {changingPassword ? 'Recalibrating...' : 'Synchronize Identity'}
                                    </button>
                                </form>

                                <div className="pt-6 border-t border-gray-50">
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 italic">Irreversible Terminal</p>
                                    <button onClick={handleDeleteAccount} className="w-full py-3 text-rose-500 font-black uppercase text-[10px] tracking-[0.2em] border-2 border-rose-50 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                                        Self-Destruct Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Dynamic Timeline */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-xl shadow-gray-200/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                <div>
                                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Your Travel Timeline</h2>
                                    <p className="text-gray-400 font-bold mt-1">Manage your {user?.role === 'customer' ? 'active reservations and history' : 'administrative summaries'}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                                        <Ticket size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Logs</p>
                                        <p className="text-2xl font-black text-indigo-600 leading-none">{bookings.length}</p>
                                    </div>
                                </div>
                            </div>

                            {user?.role === 'customer' ? (
                                <div className="space-y-8">
                                    {bookings.length === 0 ? (
                                        <div className="py-24 flex flex-col items-center text-center">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
                                                <MapPin size={40} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-400 italic">No travel logs detected.</h3>
                                            <p className="text-sm text-gray-300 mt-2 font-medium">Ready for your next adventure? Explore routes now.</p>
                                        </div>
                                    ) : (
                                        bookings.map((booking) => (
                                            <div key={booking.booking_list} className="group relative bg-gray-50/30 rounded-[2rem] p-6 border-2 border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-500">
                                                {/* Left Status Bar Indicator */}
                                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-16 rounded-r-full transition-all duration-500 ${booking.status === 'Confirmed' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                                                        booking.status === 'Pending' ? 'bg-amber-500 animate-pulse' :
                                                            booking.status === 'RefundRequested' ? 'bg-rose-500' : 'bg-gray-200'
                                                    }`}></div>

                                                <div className="flex flex-col md:flex-row gap-8">
                                                    <div className="flex-1 space-y-6">
                                                        <div className="flex justify-between items-start">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-3">
                                                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Trace No. {booking.booking_list.split(',')[0].trim()}</p>
                                                                    {booking.status === 'Pending' && <CountdownTimer bookingTime={booking.bookingtime} />}
                                                                </div>
                                                                <h4 className="text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                                    {booking.startpoint} <span className="opacity-10 font-bold mx-1">/</span> {booking.endpoint}
                                                                </h4>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-3">
                                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' :
                                                                        booking.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                                                                            booking.status === 'RefundRequested' ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-400'
                                                                    }`}>
                                                                    {booking.status}
                                                                </div>
                                                                <BoardingCountdown tripDate={booking.tripdate} departureTime={booking.departuretime} />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Departure</p>
                                                                <p className="font-bold text-gray-900 leading-none">{new Date(booking.tripdate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                                                                <p className="text-xs text-gray-400 mt-1 font-bold">{booking.departuretime}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Carriage</p>
                                                                <p className="font-bold text-gray-900 leading-none truncate max-w-[120px]" title={booking.companyname}>{booking.companyname}</p>
                                                                <p className="text-xs text-indigo-600 mt-1 font-black">{booking.busnumber} <span className="text-gray-300 font-bold">/</span> {booking.bustype}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Assets</p>
                                                                <p className="font-black text-gray-900 leading-none tracking-tight">{booking.seatnumbers}</p>
                                                                <p className="text-xs text-gray-400 mt-1 font-bold">Res. {booking.booking_list.split(',').length} Seat(s)</p>
                                                            </div>
                                                            <div className="flex flex-col justify-end">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Total Fare</p>
                                                                <p className="text-xl font-black text-gray-900">৳{booking.totalfare}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Vertical Action Bar on Hover */}
                                                    <div className="md:w-16 flex md:flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6 opacity-40 group-hover:opacity-100 transition-opacity">
                                                        {booking.status === 'Pending' && (
                                                            <button onClick={() => navigate('/payment', { state: { bookingIds: booking.booking_list.split(',').map(id => parseInt(id.trim())), trip: { tripid: booking.tripid, startpoint: booking.startpoint, endpoint: booking.endpoint, tripdate: booking.tripdate, departuretime: booking.departuretime, bustype: booking.bustype }, selectedSeats: booking.seatnumbers.split(',').map(s => ({ seatnumber: s.trim() })), totalPrice: booking.totalfare } })}
                                                                className="w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center hover:scale-110 transition-transform" title="Complete Payment">
                                                                <ChevronRight size={18} strokeWidth={3} />
                                                            </button>
                                                        )}
                                                        {booking.status === 'Confirmed' && (
                                                            <button onClick={() => handlePrintTicket(booking)}
                                                                className="w-10 h-10 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center hover:scale-110 transition-transform" title="Download Boarding Pass">
                                                                <Ticket size={18} strokeWidth={2.5} />
                                                            </button>
                                                        )}
                                                        {(booking.status === 'Confirmed' || booking.status === 'Pending') && (
                                                            <button disabled={actionLoading === booking.booking_list} onClick={() => openCancelModal(booking)}
                                                                className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all duration-300" title="Revoke Booking">
                                                                <Trash2 size={18} strokeWidth={2.5} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="p-12 bg-indigo-900 rounded-[3rem] text-white flex flex-col items-center text-center space-y-6 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent"></div>
                                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md mb-4 rotate-12">
                                        <Briefcase size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black italic relative z-10">Administrative Hub Active</h3>
                                    <p className="text-indigo-200 font-bold max-w-sm relative z-10">You are identified as an Operator. Systems for fleet management and trip scheduling are available via your primary command center.</p>
                                    <button onClick={() => navigate('/operator')} className="relative z-10 px-10 py-4 bg-white text-indigo-900 font-black uppercase text-xs tracking-widest rounded-2xl shadow-2xl hover:bg-indigo-50 transition-all">
                                        Access Dashboard
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
