import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [searchData, setSearchData] = useState({
        from: '',
        to: '',
        date: ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search?from=${searchData.from}&to=${searchData.to}&date=${searchData.date}`);
    };

    return (
        <div className="relative">
            {/* Hero Section */}
            <div className="bg-indigo-700 text-white pt-20 pb-40 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        Seamless Journeys, <span className="text-indigo-200">Sync Your Trip.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                        Book your bus tickets with ease and comfort. Explore thousands of routes across the country.
                    </p>
                </div>
            </div>

            {/* Search Container */}
            <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-10">
                <form
                    onSubmit={handleSearch}
                    className="bg-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-end border border-gray-100"
                >
                    <div className="flex-grow w-full space-y-2">
                        <label className="text-sm font-semibold text-gray-600 block flex items-center gap-1">
                            <MapPin size={16} /> From
                        </label>
                        <input
                            type="text"
                            placeholder="Source City"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800"
                            value={searchData.from}
                            onChange={(e) => setSearchData({ ...searchData, from: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex-grow w-full space-y-2">
                        <label className="text-sm font-semibold text-gray-600 block flex items-center gap-1">
                            <MapPin size={16} /> To
                        </label>
                        <input
                            type="text"
                            placeholder="Destination City"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800"
                            value={searchData.to}
                            onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
                            required
                        />
                    </div>

                    <div className="w-full md:w-56 space-y-2">
                        <label className="text-sm font-semibold text-gray-600 block flex items-center gap-1">
                            <Calendar size={16} /> Date
                        </label>
                        <input
                            type="date"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800"
                            value={searchData.date}
                            onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 hover:shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0"
                    >
                        <Search size={20} />
                        Search Buses
                    </button>
                </form>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 py-24">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-16 underline decoration-indigo-200 decoration-8 underline-offset-8">
                    Why Choose TripSync?
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="p-8 rounded-3xl bg-white border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Trusted by Millions</h3>
                        <p className="text-gray-600 leading-relaxed">
                            We've helped thousands of travelers reach their destinations safely and on time.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-white border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Real-time Tracking</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Stay updated with live bus locations and expected arrival times.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-white border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <MapPin size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Widest Network</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Connectivity to even the remotest parts of the country with premium operators.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
