import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
                            <Bus size={32} />
                            <span>TripSync</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6">
                        {(!user || user.role !== 'operator') && (
                            <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium tracking-tight">Home</Link>
                        )}
                        {user ? (
                            <>
                                {user.role === 'operator' && (
                                    <Link to="/operator" className="text-gray-600 hover:text-indigo-600 font-medium text-blue-100">Operator Dashboard</Link>
                                )}
                                <div className="flex items-center gap-3 ml-4 pl-4 border-l">
                                    <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <User size={16} />
                                        </div>
                                        <span>{user.name}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium">Login</Link>
                                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
