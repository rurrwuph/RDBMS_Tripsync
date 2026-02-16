import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Route data to ensure only possible combinations are shown
const routes = [
    { "routeid": 1, "startpoint": "Dhaka", "endpoint": "Chittagong" },
    { "routeid": 2, "startpoint": "Dhaka", "endpoint": "Sylhet" },
    { "routeid": 3, "startpoint": "Dhaka", "endpoint": "Cox's Bazar" },
    { "routeid": 4, "startpoint": "Dhaka", "endpoint": "Rajshahi" },
    { "routeid": 5, "startpoint": "Chittagong", "endpoint": "Sylhet" },
    { "routeid": 6, "startpoint": "Chittagong", "endpoint": "Dhaka" },
    { "routeid": 7, "startpoint": "Dhaka", "endpoint": "Khulna" },
    { "routeid": 8, "startpoint": "Dhaka", "endpoint": "Rangpur" },
    { "routeid": 9, "startpoint": "Dhaka", "endpoint": "Barisal" },
    { "routeid": 10, "startpoint": "Sylhet", "endpoint": "Dhaka" },
    { "routeid": 11, "startpoint": "Khulna", "endpoint": "Dhaka" },
    { "routeid": 12, "startpoint": "Rangpur", "endpoint": "Dhaka" },
    { "routeid": 13, "startpoint": "Rajshahi", "endpoint": "Dhaka" },
    { "routeid": 14, "startpoint": "Cox's Bazar", "endpoint": "Dhaka" }
];

const AutocompleteInput = ({ label, options, value, onChange, placeholder, disabled, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState(value || '');
    const wrapperRef = useRef(null);

    // Filter options based on user typing
    const filtered = useMemo(() =>
        options.filter(opt => opt.toLowerCase().includes(query.toLowerCase())),
        [options, query]);

    // Sync internal query state with parent value state (important for resets)
    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex-grow w-full space-y-2 relative" ref={wrapperRef}>
            <label className="text-sm font-semibold text-gray-600 block flex items-center gap-1">
                <Icon size={16} /> {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    disabled={disabled}
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => !disabled && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => { setQuery(''); onChange(''); }}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {isOpen && filtered.length > 0 && (
                <ul className="absolute z-[100] w-full mt-1 bg-white border border-gray-100 shadow-xl rounded-xl max-h-56 overflow-y-auto py-2">
                    {filtered.map(opt => (
                        <li
                            key={opt}
                            onClick={() => { onChange(opt); setQuery(opt); setIsOpen(false); }}
                            className="px-4 py-2.5 hover:bg-indigo-50 cursor-pointer text-gray-700 font-medium transition-colors"
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const [searchData, setSearchData] = useState({ from: '', to: '', date: '' });

    // Get unique start points
    const startPoints = useMemo(() => [...new Set(routes.map(r => r.startpoint))].sort(), []);

    // Get unique end points based on selected start point
    const availableEndPoints = useMemo(() => {
        return routes
            .filter(r => r.startpoint === searchData.from)
            .map(r => r.endpoint)
            .sort();
    }, [searchData.from]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchData.from && searchData.to && searchData.date) {
            navigate(`/search?from=${searchData.from}&to=${searchData.to}&date=${searchData.date}`);
        }
    };

    return (
        <div className="relative">
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

            <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-10">
                <form
                    onSubmit={handleSearch}
                    className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-end border border-gray-100"
                >
                    <AutocompleteInput
                        label="From"
                        icon={MapPin}
                        options={startPoints}
                        value={searchData.from}
                        onChange={(val) => setSearchData({ ...searchData, from: val, to: '' })}
                        placeholder="Source City"
                    />

                    <AutocompleteInput
                        label="To"
                        icon={MapPin}
                        options={availableEndPoints}
                        value={searchData.to}
                        onChange={(val) => setSearchData({ ...searchData, to: val })}
                        placeholder="Destination City"
                        disabled={!searchData.from}
                    />

                    <div className="w-full md:w-56 space-y-2">
                        <label className="text-sm font-semibold text-gray-600 block flex items-center gap-1">
                            <Calendar size={16} /> Date
                        </label>
                        <input
                            type="date"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800"
                            value={searchData.date}
                            min={new Date().toISOString().split('T')[0]} // Prevent past dates
                            onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full md:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 hover:shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0"
                    >
                        <Search size={20} />
                        Search Buses
                    </button>
                </form>
            </div>

            {/* Features Section ... same as before */}
            <div className="max-w-7xl mx-auto px-4 py-24">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-16 underline decoration-indigo-200 decoration-8 underline-offset-8">
                    Why Choose TripSync?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <FeatureCard icon={<Users size={32} />} title="Trusted by Millions" text="We've helped thousands of travelers reach their destinations safely." bgColor="bg-indigo-100" textColor="text-indigo-600" />
                    <FeatureCard icon={<Search size={32} />} title="Real-time Tracking" text="Stay updated with live bus locations and expected arrival times." bgColor="bg-emerald-100" textColor="text-emerald-600" />
                    <FeatureCard icon={<MapPin size={32} />} title="Widest Network" text="Connectivity to even the remotest parts with premium operators." bgColor="bg-amber-100" textColor="text-amber-600" />
                </div>
            </div>
        </div>
    );
};

// Small helper component for the features
const FeatureCard = ({ icon, title, text, bgColor, textColor }) => (
    <div className="p-8 rounded-3xl bg-white border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
        <div className={`w-16 h-16 ${bgColor} ${textColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{text}</p>
    </div>
);

export default Home;