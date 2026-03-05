ALTER TABLE PAYMENT 
ADD COLUMN PaymentStatus VARCHAR(20) DEFAULT 'Completed' 
CHECK (PaymentStatus IN ('Completed', 'Partially Refunded', 'Fully Refunded'));

ALTER TABLE REFUND 
ADD COLUMN BookingID INT NOT NULL, 
ADD CONSTRAINT fk_refund_booking 
FOREIGN KEY (BookingID) REFERENCES BOOKING(BookingID) ON DELETE CASCADE;

ALTER TABLE BOOKING DROP CONSTRAINT IF EXISTS booking_bookingstatus_check;

ALTER TABLE BOOKING ADD CONSTRAINT booking_status_check 
CHECK (BookingStatus IN ('Pending', 'Confirmed', 'Cancelled'));

ALTER TABLE BOOKING ALTER COLUMN BookingStatus SET DEFAULT 'Pending';

ALTER TABLE BOOKING ADD COLUMN PaymentID INT;

ALTER TABLE BOOKING 
ADD CONSTRAINT fk_booking_payment 
FOREIGN KEY (PaymentID) REFERENCES PAYMENT(PaymentID) ON DELETE SET NULL;



ALTER TABLE BOOKING DROP CONSTRAINT IF EXISTS booking_status_check;

ALTER TABLE BOOKING ADD CONSTRAINT booking_status_check 
CHECK (BookingStatus IN ('Pending', 'Confirmed', 'Cancelled', 'RefundRequested'));

-- Fix for the "Seat Already Booked" issue after refund
-- Drop the restrictive unique constraint that prevents re-booking cancelled seats
ALTER TABLE BOOKING DROP CONSTRAINT IF EXISTS uq_trip_seat_booking;