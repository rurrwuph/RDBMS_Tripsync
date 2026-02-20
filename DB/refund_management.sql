-- 1. Trigger Function to auto-create Refund request when Booking becomes 'RefundRequested'
CREATE OR REPLACE FUNCTION trigger_create_refund_request()
RETURNS TRIGGER AS $$
DECLARE
    v_payment_id INT;
    v_amount DECIMAL;
BEGIN
    -- Only act if status changed to 'RefundRequested'
    IF NEW.BookingStatus = 'RefundRequested' AND OLD.BookingStatus <> 'RefundRequested' THEN
        
        -- Get payment details for this booking
        SELECT PaymentID, Amount INTO v_payment_id, v_amount
        FROM PAYMENT
        WHERE BookingID = NEW.BookingID
        LIMIT 1;

        IF v_payment_id IS NOT NULL THEN
            -- Check if a pending refund request already exists to avoid duplicates
            IF NOT EXISTS (SELECT 1 FROM REFUND WHERE BookingID = NEW.BookingID AND Status = 'Pending') THEN
                INSERT INTO REFUND (PaymentID, BookingID, RefundAmount, Status)
                VALUES (v_payment_id, NEW.BookingID, v_amount, 'Pending');
            END IF;
        ELSE
            -- This shouldn't happen if the booking was 'Confirmed', but as a safety:
            RAISE NOTICE 'No payment found for booking %; refund record not created.', NEW.BookingID;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to BOOKING table
DROP TRIGGER IF EXISTS trg_after_booking_refund_request ON BOOKING;
CREATE TRIGGER trg_after_booking_refund_request
AFTER UPDATE ON BOOKING
FOR EACH ROW
EXECUTE FUNCTION trigger_create_refund_request();


-- 2. View for Operators to see refund requests
CREATE OR REPLACE VIEW v_operator_refunds AS
SELECT 
    r.RefundID as refundid,
    r.BookingID as bookingid,
    c.FullName as customername,
    rt.StartPoint as startpoint,
    rt.EndPoint as endpoint,
    t.TripDate as tripdate,
    t.DepartureTime as departuretime,
    s.SeatNumber as seatnumber,
    r.RefundAmount as amount,
    r.Status as refundstatus,
    r.CreatedAt as requestedat,
    t.OperatorID as operatorid
FROM REFUND r
JOIN BOOKING b ON r.BookingID = b.BookingID
JOIN CUSTOMER c ON b.CustomerID = c.CustomerID
JOIN TRIP t ON b.TripID = t.TripID
JOIN ROUTE rt ON t.RouteID = rt.RouteID
JOIN SEAT s ON b.SeatID = s.SeatID;


-- 3. Procedure for Operator to Process Refund
CREATE OR REPLACE PROCEDURE handle_refund_decision(
    p_refund_id INT,
    p_operator_id INT,
    p_decision VARCHAR -- 'Approved' or 'Rejected'
) AS $$
DECLARE
    v_booking_id INT;
    v_owner_operator_id INT;
BEGIN
    -- Verify the refund exists and belongs to this operator's trip
    SELECT b.BookingID, t.OperatorID 
    INTO v_booking_id, v_owner_operator_id
    FROM REFUND r
    JOIN BOOKING b ON r.BookingID = b.BookingID
    JOIN TRIP t ON b.TripID = t.TripID
    WHERE r.RefundID = p_refund_id;

    IF v_owner_operator_id IS NULL THEN
        RAISE EXCEPTION 'Refund request not found.';
    END IF;

    IF v_owner_operator_id <> p_operator_id THEN
        RAISE EXCEPTION 'Unauthorized: This trip does not belong to you.';
    END IF;

    -- Update the REFUND status
    UPDATE REFUND 
    SET Status = p_decision 
    WHERE RefundID = p_refund_id;

    -- The trigger 'trg_after_refund_status_update' will handle the cascading BOOKING status change.
END;
$$ LANGUAGE plpgsql;


-- 4. Trigger Function on REFUND table to update BOOKING status automatically
CREATE OR REPLACE FUNCTION trigger_sync_refund_to_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Only act if Status was updated
    IF NEW.Status <> OLD.Status THEN
        IF NEW.Status = 'Approved' THEN
            -- Change booking status to 'Cancelled' (effectively freeing the seat)
            UPDATE BOOKING 
            SET BookingStatus = 'Cancelled' 
            WHERE BookingID = NEW.BookingID;
            
            -- Also update Payment status if applicable
            UPDATE PAYMENT
            SET PaymentStatus = 'Fully Refunded'
            WHERE PaymentID = NEW.PaymentID;

        ELSIF NEW.Status = 'Rejected' THEN
            -- Revert booking status back to 'Confirmed'
            UPDATE BOOKING 
            SET BookingStatus = 'Confirmed' 
            WHERE BookingID = NEW.BookingID;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to REFUND table
DROP TRIGGER IF EXISTS trg_after_refund_status_change ON REFUND;
CREATE TRIGGER trg_after_refund_status_change
AFTER UPDATE ON REFUND
FOR EACH ROW
EXECUTE FUNCTION trigger_sync_refund_to_booking();
