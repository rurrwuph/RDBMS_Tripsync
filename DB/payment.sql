CREATE OR REPLACE FUNCTION process_payment_secure(
    p_booking_ids INT[],
    p_customer_id INT,
    p_paid_amount DECIMAL,     
    p_method VARCHAR
) RETURNS JSON AS $$
DECLARE
    v_total_fare DECIMAL := 0;
    v_valid_count INT := 0;
    v_seat_fare DECIMAL;
    v_b_id INT;
    v_payment_id INT;
BEGIN
    SELECT SUM(t.BaseFare), COUNT(b.BookingID)
    INTO v_total_fare, v_valid_count
    FROM BOOKING b
    JOIN TRIP t ON b.TripID = t.TripID
    WHERE b.BookingID = ANY(p_booking_ids) 
      AND b.CustomerID = p_customer_id
      AND b.BookingStatus = 'Pending';

    IF v_valid_count <> array_length(p_booking_ids, 1) THEN
        RETURN json_build_object('success', false, 'message', 'Invalid bookings selected');
    END IF;

    IF p_paid_amount < v_total_fare THEN
        RETURN json_build_object('success', false, 'message', 'Insufficient amount');
    END IF;

    FOREACH v_b_id IN ARRAY p_booking_ids LOOP
        SELECT t.BaseFare INTO v_seat_fare 
        FROM BOOKING b JOIN TRIP t ON b.TripID = t.TripID 
        WHERE b.BookingID = v_b_id;

        INSERT INTO PAYMENT (BookingID, Amount, PaymentMethod, PaymentStatus)
        VALUES (v_b_id, v_seat_fare, p_method, 'Completed')
        RETURNING PaymentID INTO v_payment_id;
        UPDATE BOOKING 
        SET BookingStatus = 'Confirmed', PaymentID = v_payment_id 
        WHERE BookingID = v_b_id;  
    END LOOP;

    RETURN json_build_object(
        'success', true, 
        'message', 'Payment successful for ' || v_valid_count || ' seats individually.'
    );
END;
$$ LANGUAGE plpgsql;