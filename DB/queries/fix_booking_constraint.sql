-- Create a partial unique index that only enforces uniqueness for active (non-cancelled) bookings
-- This allows a seat to be booked again if the previous booking was cancelled.
CREATE UNIQUE INDEX IF NOT EXISTS uq_trip_seat_active_booking 
ON BOOKING (TripID, SeatID) 
WHERE (BookingStatus <> 'Cancelled');
