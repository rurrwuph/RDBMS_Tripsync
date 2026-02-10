CREATE OR REPLACE FUNCTION process_payment_secure(
    p_booking_id INT,
    p_customer_id INT,
    p_paid_amount DECIMAL,     
    p_method VARCHAR
) RETURNS JSON AS $$
DECLARE
    v_actual_fare DECIMAL;
    v_status VARCHAR;
    v_existing_payment_id INT;
    v_owner_id INT;
    v_payment_id INT;
BEGIN

    SELECT b.BookingStatus, b.CustomerID, t.BaseFare, b.PaymentID 
    INTO v_status, v_owner_id, v_actual_fare, v_existing_payment_id
    FROM BOOKING b
    JOIN TRIP t ON b.TripID = t.TripID
    WHERE b.BookingID = p_booking_id;

    IF v_owner_id IS NULL OR v_owner_id <> p_customer_id THEN
        RETURN json_build_object('success', false, 'message', 'Unauthorized: Booking not found');
    END IF;

    IF v_status = 'Confirmed' OR v_existing_payment_id IS NOT NULL THEN
        RETURN json_build_object('success', false, 'message', 'Booking already paid');
    END IF;

    IF p_paid_amount < v_actual_fare THEN
        RETURN json_build_object('success', false, 'message', 'Insufficient amount provided');
    END IF;

    INSERT INTO PAYMENT (BookingID, Amount, PaymentMethod, PaymentStatus)
    VALUES (p_booking_id, p_paid_amount, p_method, 'Completed')
    RETURNING PaymentID INTO v_payment_id;

    UPDATE BOOKING SET BookingStatus = 'Confirmed', PaymentID = v_payment_id WHERE BookingID = p_booking_id;

    RETURN json_build_object(
        'success', true, 
        'message', 'Payment successful', 
        'payment_id', v_payment_id
    );
END;
$$ LANGUAGE plpgsql;