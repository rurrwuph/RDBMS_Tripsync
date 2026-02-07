CREATE OR REPLACE PROCEDURE complete_booking_payment(
    p_booking_id INT,
    p_amount DECIMAL,
    p_method VARCHAR,
    INOUT p_payment_id INT DEFAULT NULL
) AS $$
BEGIN

    INSERT INTO PAYMENT (BookingID, Amount, PaymentMethod, PaymentStatus)
    VALUES (p_booking_id, p_amount, p_method, 'Completed')
    RETURNING PaymentID INTO p_payment_id;

    UPDATE BOOKING 
    SET BookingStatus = 'Confirmed' 
    WHERE BookingID = p_booking_id;

END;
$$ LANGUAGE plpgsql;