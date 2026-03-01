-- BOOKING MANAGEMENT

-- 1. Create Bulk Booking
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

-- 2. Cleanup "Ghost Seats" (Pending bookings older than 10 mins)
CREATE OR REPLACE FUNCTION cleanup_expired_bookings() 
RETURNS VOID AS $$
DECLARE
    booking_cursor CURSOR FOR 
        SELECT BookingID FROM BOOKING 
        WHERE BookingStatus = 'Pending' 
        AND BookingTime < NOW() - INTERVAL '10 minutes';
    rec RECORD;
BEGIN
    OPEN booking_cursor;
    LOOP
        FETCH booking_cursor INTO rec;
        EXIT WHEN NOT FOUND;
        UPDATE BOOKING 
        SET BookingStatus = 'Cancelled' 
        WHERE BookingID = rec.BookingID;
        RAISE NOTICE 'Expired booking % has been auto-cancelled.', rec.BookingID;
    END LOOP;
    CLOSE booking_cursor;
END;
$$ LANGUAGE plpgsql;

-- 3. Customer Booking View
CREATE OR REPLACE VIEW v_customer_bookings AS
SELECT 
    b.CustomerID,
    b.TripID,
    STRING_AGG(b.BookingID::text, ', ' ORDER BY b.BookingID) as booking_list,
    b.BookingStatus as status, 
    b.BookingTime as bookingtime,
    t.TripDate as tripdate, 
    t.DepartureTime as departuretime,
    r.StartPoint as startpoint, 
    r.EndPoint as endpoint,
    bus.BusNumber as busnumber, 
    bus.BusType as bustype,
    STRING_AGG(s.SeatNumber, ', ' ORDER BY s.SeatNumber) as seatnumbers,
    SUM(t.BaseFare) as totalfare
FROM BOOKING b
JOIN TRIP t ON b.TripID = t.TripID
JOIN ROUTE r ON t.RouteID = r.RouteID
JOIN BUS bus ON t.BusID = bus.BusID
JOIN SEAT s ON b.SeatID = s.SeatID
GROUP BY 
    b.CustomerID, 
    b.TripID, 
    b.BookingStatus, 
    b.BookingTime, 
    t.TripDate, 
    t.DepartureTime, 
    r.StartPoint, 
    r.EndPoint, 
    bus.BusNumber, 
    bus.BusType;


-- 4. Cancel or Request Refund (Customer)
CREATE OR REPLACE PROCEDURE cancel_or_request_refund(
    p_booking_id INT,
    p_customer_id INT,
    p_reason TEXT DEFAULT NULL,
    p_issue_type VARCHAR(100) DEFAULT 'Cancellation'
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
        
        -- Optional: Log reason for pending cancellation too
        IF p_reason IS NOT NULL THEN
            INSERT INTO COMPLAINT (CustomerID, BookingID, IssueType, Description, Status)
            VALUES (p_customer_id, p_booking_id, p_issue_type, p_reason, 'Open');
        END IF;
        
    ELSIF v_current_status = 'Confirmed' THEN
        UPDATE BOOKING 
        SET BookingStatus = 'RefundRequested' 
        WHERE BookingID = p_booking_id;
        
        -- Create a complaint record for the refund/cancellation reason
        IF p_reason IS NOT NULL THEN
            INSERT INTO COMPLAINT (CustomerID, BookingID, IssueType, Description, Status)
            VALUES (p_customer_id, p_booking_id, p_issue_type, p_reason, 'Open');
        END IF;
        
    ELSE
        RAISE EXCEPTION 'Booking cannot be cancelled in its current state (%)', v_current_status;
    END IF;
END;
$$ LANGUAGE plpgsql;


