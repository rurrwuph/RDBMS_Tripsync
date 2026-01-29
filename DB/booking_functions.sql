--create booking
CREATE OR REPLACE PROCEDURE create_booking(
    p_customer_id INT,
    p_trip_id INT,
    p_seat_id INT,
    INOUT p_booking_id INT DEFAULT NULL
) AS $$
BEGIN
    INSERT INTO BOOKING (CustomerID, TripID, SeatID, BookingStatus)
    VALUES (p_customer_id, p_trip_id, p_seat_id, 'Confirmed')
    RETURNING BookingID INTO p_booking_id;
END;
$$ LANGUAGE plpgsql;
