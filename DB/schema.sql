-- 1. OPERATOR Table
-- One record = One Company + One Admin. Admin logs in with CompanyName + AdminEmail.
CREATE TABLE OPERATOR (
    OperatorID SERIAL PRIMARY KEY,
    CompanyName VARCHAR(100) UNIQUE NOT NULL, 
    AdminEmail VARCHAR(100) UNIQUE NOT NULL,
    AdminPassword_Hash TEXT NOT NULL,         
    LicenseNumber VARCHAR(50) UNIQUE NOT NULL,
    Status VARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive', 'Suspended'))
);

-- 2. CUSTOMER Table
-- Standard passengers who book tickets.
CREATE TABLE CUSTOMER (
    CustomerID SERIAL PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password_Hash TEXT NOT NULL,
    Phone VARCHAR(20),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. BUS Table
CREATE TABLE BUS (
    BusID SERIAL PRIMARY KEY,
    OperatorID INT NOT NULL,
    BusNumber VARCHAR(20) UNIQUE NOT NULL,
    BusType VARCHAR(20) NOT NULL CHECK (BusType IN ('AC', 'Non-AC', 'Sleeper')),
    TotalSeats INT NOT NULL CHECK (TotalSeats > 0),
    CONSTRAINT fk_bus_operator FOREIGN KEY (OperatorID) REFERENCES OPERATOR(OperatorID) ON DELETE CASCADE
);

-- 4. SEAT Table
CREATE TABLE SEAT (
    SeatID SERIAL PRIMARY KEY,
    BusID INT NOT NULL,
    SeatNumber VARCHAR(10) NOT NULL,
    SeatType VARCHAR(20) CHECK (SeatType IN ('Window', 'Aisle')),
    CONSTRAINT fk_seat_bus FOREIGN KEY (BusID) REFERENCES BUS(BusID) ON DELETE CASCADE,
    CONSTRAINT uq_bus_seat UNIQUE (BusID, SeatNumber)
);

-- 5. ROUTE Table
CREATE TABLE ROUTE (
    RouteID SERIAL PRIMARY KEY,
    StartPoint VARCHAR(100) NOT NULL,
    EndPoint VARCHAR(100) NOT NULL
);

-- 6. TRIP Table
-- Scheduled by the specific Operator Admin.
CREATE TABLE TRIP (
    TripID SERIAL PRIMARY KEY,
    OperatorID INT NOT NULL,
    RouteID INT NOT NULL,
    BusID INT NOT NULL,
    TripDate DATE NOT NULL,
    DepartureTime TIME NOT NULL,
    BaseFare DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_trip_operator FOREIGN KEY (OperatorID) REFERENCES OPERATOR(OperatorID) ON DELETE CASCADE,
    CONSTRAINT fk_trip_route FOREIGN KEY (RouteID) REFERENCES ROUTE(RouteID) ON DELETE CASCADE,
    CONSTRAINT fk_trip_bus FOREIGN KEY (BusID) REFERENCES BUS(BusID) ON DELETE CASCADE
);

-- 7. BOOKING Table
CREATE TABLE BOOKING (
    BookingID SERIAL PRIMARY KEY,
    CustomerID INT NOT NULL,
    TripID INT NOT NULL,
    SeatID INT NOT NULL,
    BookingTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    BookingStatus VARCHAR(20) DEFAULT 'Confirmed' CHECK (BookingStatus IN ('Confirmed', 'Cancelled')),
    CONSTRAINT fk_booking_customer FOREIGN KEY (CustomerID) REFERENCES CUSTOMER(CustomerID) ON DELETE CASCADE,
    CONSTRAINT fk_booking_trip FOREIGN KEY (TripID) REFERENCES TRIP(TripID) ON DELETE CASCADE,
    CONSTRAINT fk_booking_seat FOREIGN KEY (SeatID) REFERENCES SEAT(SeatID) ON DELETE CASCADE,
    CONSTRAINT uq_trip_seat_booking UNIQUE (TripID, SeatID)
);

-- 8. PAYMENT Table
CREATE TABLE PAYMENT (
    PaymentID SERIAL PRIMARY KEY,
    BookingID INT NOT NULL,
    Amount DECIMAL(10, 2) NOT NULL CHECK (Amount >= 0),
    PaymentMethod VARCHAR(50) NOT NULL,
    PaymentTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_booking FOREIGN KEY (BookingID) REFERENCES BOOKING(BookingID) ON DELETE CASCADE
);

-- 9. REFUND Table
CREATE TABLE REFUND (
    RefundID SERIAL PRIMARY KEY,
    PaymentID INT NOT NULL,
    RefundAmount DECIMAL(10, 2) NOT NULL CHECK (RefundAmount >= 0),
    Status VARCHAR(20) DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Approved', 'Rejected')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refund_payment FOREIGN KEY (PaymentID) REFERENCES PAYMENT(PaymentID) ON DELETE CASCADE
);

-- 10. COMPLAINT Table
-- Logged by Customers against a specific booking or general issue.
CREATE TABLE COMPLAINT (
    ComplaintID SERIAL PRIMARY KEY,
    CustomerID INT NOT NULL,
    BookingID INT, 
    IssueType VARCHAR(100) NOT NULL,
    Description TEXT NOT NULL,
    Status VARCHAR(20) DEFAULT 'Open' CHECK (Status IN ('Open', 'In-progress', 'Resolved')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaint_customer FOREIGN KEY (CustomerID) REFERENCES CUSTOMER(CustomerID) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_booking FOREIGN KEY (BookingID) REFERENCES BOOKING(BookingID) ON DELETE SET NULL
);

-- 11. COMPLAINT_ACTIONS Table
-- Resolved by the Operator Admin.
CREATE TABLE COMPLAINT_ACTIONS (
    ActionID SERIAL PRIMARY KEY,
    ComplaintID INT NOT NULL,
    OperatorID INT NOT NULL, -- The Admin performing the action
    ActionTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ActionDescription TEXT NOT NULL,
    CONSTRAINT fk_action_complaint FOREIGN KEY (ComplaintID) REFERENCES COMPLAINT(ComplaintID) ON DELETE CASCADE,
    CONSTRAINT fk_action_operator FOREIGN KEY (OperatorID) REFERENCES OPERATOR(OperatorID) ON DELETE CASCADE
);