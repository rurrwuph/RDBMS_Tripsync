-- SAMPLE DATA FOR TRIPSYNC DATABASE

-- 1. OPERATOR Data
INSERT INTO OPERATOR (CompanyName, AdminEmail, AdminPassword_Hash, LicenseNumber) VALUES
('Green Line Paribahan', 'admin@greenline.com', '123456', 'GL-1001'),
('Hanif Enterprise', 'admin@hanif.com', 'qwerty', 'HE-2002'),
('Shohagh Paribahan', 'admin@shohagh.com', '123456', 'SP-3003'),
('Ena Transport', 'admin@ena.com', 'qwerty', 'ET-4004'),
('Shyamoli NR Travels', 'admin@shyamoli.com', '123456', 'SN-5005');

-- 2. CUSTOMER Data
INSERT INTO CUSTOMER (FullName, Email, Password_Hash, Phone) VALUES
('John Doe', 'john@example.com', '123456', '01711223344'),
('Jane Smith', 'jane@example.com', 'qwerty', '01811223344'),
('Akash Ahmed', 'akash@example.com', '123456', '01911223344'),
('Sarah Kabir', 'sarah@example.com', 'qwerty', '01611223344'),
('Rahul Sharma', 'rahul@example.com', '123456', '01511223344');

-- 3. BUS Data
-- Assuming OperatorID 1 is Green Line, 2 is Hanif
INSERT INTO BUS (OperatorID, BusNumber, BusType, TotalSeats) VALUES
(1, 'GL-001', 'AC', 36),
(1, 'GL-002', 'Non-AC', 40),
(2, 'HE-101', 'AC', 32),
(4, 'ET-201', 'AC', 36),
(5, 'SN-301', 'Non-AC', 40);

-- 4. SEAT Data (Sample for Bus 1)
INSERT INTO SEAT (BusID, SeatNumber, SeatType) VALUES
(1, 'A1', 'Window'),
(1, 'A2', 'Aisle'),
(1, 'A3', 'Aisle'),
(1, 'A4', 'Window'),
(2, 'B1', 'Window'),
(2, 'B2', 'Aisle'),
(4, 'C1', 'Window'),
(4, 'C2', 'Aisle'),
(5, 'D1', 'Window'),
(5, 'D2', 'Aisle');

-- 5. ROUTE Data
INSERT INTO ROUTE (StartPoint, EndPoint) VALUES
('Dhaka', 'Chittagong'),
('Dhaka', 'Sylhet'),
('Dhaka', 'Cox''s Bazar'),
('Dhaka', 'Rajshahi'),
('Chittagong', 'Sylhet');

-- 6. TRIP Data
-- Assuming BusID 1, RouteID 1, OperatorID 1
INSERT INTO TRIP (OperatorID, RouteID, BusID, TripDate, DepartureTime, BaseFare) VALUES
(1, 1, 1, '2026-02-01', '08:00:00', 1200.00),
(1, 2, 2, '2026-02-01', '10:00:00', 700.00),
(2, 3, 3, '2026-02-02', '22:30:00', 1500.00),
(4, 4, 4, '2026-02-03', '07:30:00', 800.00),
(5, 5, 5, '2026-02-03', '21:00:00', 950.00);

-- 7. BOOKING Data
-- Customer 1, Trip 1, Seat 1
INSERT INTO BOOKING (CustomerID, TripID, SeatID, BookingStatus) VALUES
(1, 1, 1, 'Confirmed'),
(2, 1, 2, 'Confirmed'),
(4, 4, 7, 'Confirmed'),
(5, 5, 9, 'Confirmed');

-- 8. PAYMENT Data
INSERT INTO PAYMENT (BookingID, Amount, PaymentMethod) VALUES
(1, 1200.00, 'bKash'),
(2, 1200.00, 'Nagad'),
(3, 800.00, 'Rocket'),
(4, 950.00, 'Visa');

-- 9. COMPLAINT Data
INSERT INTO COMPLAINT (CustomerID, BookingID, IssueType, Description) VALUES
(3, NULL, 'General', 'How can I reset my password?'),
(1, 1, 'Service', 'AC was not working properly during the trip.');
