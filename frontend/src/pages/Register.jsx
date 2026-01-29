import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ShieldCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('customer');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        companyName: '',
        licenseNumber: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post('/api/auth/register', {
                ...formData,
                type: role,
                name: formData.fullName
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
            <div className="max-w-xl w-full">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Join TripSync</h2>
                    <p className="mt-2 text-gray-600">Start your journey with us today</p>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-10">
                        <button
                            onClick={() => setRole('customer')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${role === 'customer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Passenger Account
                        </button>
                        <button
                            onClick={() => setRole('operator')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${role === 'operator' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Bus Operator
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    <User size={16} /> Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    <Mail size={16} /> Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    <Lock size={16} /> Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    <Phone size={16} /> Phone Number
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            {role === 'operator' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                            <ShieldCheck size={16} /> Company Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                            <ShieldCheck size={16} /> License Number
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                            value={formData.licenseNumber}
                                            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Create Account</>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-gray-500">Already have an account? </span>
                        <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
