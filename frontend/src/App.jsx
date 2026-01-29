import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchResults from './pages/SearchResults';
import OperatorDashboard from './pages/OperatorDashboard';
import BusManagement from './pages/BusManagement';
import AssignTrip from './pages/AssignTrip';
import Booking from './pages/Booking';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="operator" element={<OperatorDashboard />} />
          <Route path="operator/buses" element={<BusManagement />} />
          <Route path="operator/assign-trip" element={<AssignTrip />} />
          <Route path="booking/:tripId" element={<Booking />} />
          {/* Add more routes here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
