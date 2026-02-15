
CREATE OR REPLACE PROCEDURE create_booking_bulk(
    p_customer_id INT,
    p_trip_id INT,
    p_seat_ids INT[], 
    INOUT p_booking_ids INT[] DEFAULT '{}'
) AS $$
DECLARE
    v_seat_id INT;
    v_new_id INT;
BEGIN
    p_booking_ids := '{}'; 

    FOREACH v_seat_id IN ARRAY p_seat_ids LOOP
        INSERT INTO BOOKING (CustomerID, TripID, SeatID, BookingStatus, PaymentID)
        VALUES (p_customer_id, p_trip_id, v_seat_id, 'Pending', NULL)
        RETURNING BookingID INTO v_new_id;
        
        p_booking_ids := array_append(p_booking_ids, v_new_id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE PROCEDURE cancel_or_request_refund(
    p_booking_id INT,
    p_customer_id INT
) AS $$
DECLARE
    v_current_status VARCHAR;
BEGIN
    SELECT BookingStatus INTO v_current_status
    FROM BOOKING
    WHERE BookingID = p_booking_id AND CustomerID = p_customer_id;

    IF v_current_status = 'Pending' THEN
        UPDATE BOOKING 
        SET BookingStatus = 'Cancelled' 
        WHERE BookingID = p_booking_id;
        
    ELSIF v_current_status = 'Confirmed' THEN
        UPDATE BOOKING 
        SET BookingStatus = 'RefundRequested' 
        WHERE BookingID = p_booking_id;
        
    ELSE
        RAISE EXCEPTION 'Booking cannot be cancelled in its current state (%)', v_current_status;
    END IF;
END;
$$ LANGUAGE plpgsql;