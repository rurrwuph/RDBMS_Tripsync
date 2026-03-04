-- OPERATOR MANAGEMENT

-- 1. Get Operator Stats
CREATE OR REPLACE FUNCTION get_operator_stats(p_operator_id INT)
RETURNS TABLE (
    total_buses BIGINT,
    active_trips BIGINT,
    today_bookings BIGINT,
    today_revenue DECIMAL(12, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM BUS WHERE OperatorID = p_operator_id) as total_buses,
        (SELECT COUNT(*) FROM TRIP WHERE OperatorID = p_operator_id AND TripDate >= CURRENT_DATE) as active_trips,
        (SELECT COUNT(*) 
         FROM BOOKING b
         JOIN TRIP t ON b.TripID = t.TripID
         WHERE t.OperatorID = p_operator_id 
         AND b.BookingStatus = 'Confirmed'
         AND b.BookingTime::DATE = CURRENT_DATE) as today_bookings,
        (SELECT COALESCE(SUM(t.BaseFare), 0)
         FROM BOOKING b
         JOIN TRIP t ON b.TripID = t.TripID
         WHERE t.OperatorID = p_operator_id
         AND b.BookingStatus = 'Confirmed'
         AND b.BookingTime::DATE = CURRENT_DATE) as today_revenue;
END;
$$ LANGUAGE plpgsql;

-- 2. Get Pending Operator Actions
CREATE OR REPLACE FUNCTION get_pending_operator_actions(p_operator_id INT)
RETURNS TABLE (
    tripid INT,
    bookingids TEXT,
    paymentid INT,
    customername VARCHAR,
    seatnumbers TEXT,
    status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.TripID as tripid,
        STRING_AGG(b.BookingID::text, ', ') as bookingids,
        b.PaymentID as paymentid,
        c.FullName as customername,
        STRING_AGG(s.SeatNumber, ', ') as seatnumbers,
        b.BookingStatus as status
    FROM BOOKING b
    JOIN TRIP t ON b.TripID = t.TripID
    JOIN CUSTOMER c ON b.CustomerID = c.CustomerID
    JOIN SEAT s ON b.SeatID = s.SeatID
    WHERE t.OperatorID = p_operator_id
    AND b.BookingStatus IN ('Pending', 'RefundRequested')
    GROUP BY b.TripID, b.PaymentID, c.FullName, b.BookingStatus, b.BookingTime
    ORDER BY b.BookingTime DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. Get Operator Analytics
CREATE OR REPLACE FUNCTION get_operator_analytics(p_operator_id INT)
RETURNS TABLE (
    trip_date DATE,
    route_id INT,
    start_point VARCHAR,
    end_point VARCHAR,
    total_bookings BIGINT,
    total_revenue DECIMAL(12, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.TripDate as trip_date,
        t.RouteID as route_id,
        r.StartPoint as start_point,
        r.EndPoint as end_point,
        COUNT(b.BookingID) as total_bookings,
        SUM(t.BaseFare) as total_revenue
    FROM BOOKING b
    JOIN TRIP t ON b.TripID = t.TripID
    JOIN ROUTE r ON t.RouteID = r.RouteID
    WHERE t.OperatorID = p_operator_id 
    AND b.BookingStatus = 'Confirmed'
    GROUP BY CUBE(t.TripDate, (t.RouteID, r.StartPoint, r.EndPoint))
    ORDER BY t.TripDate DESC NULLS LAST, t.RouteID ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- 4. Get Operator Complaints
CREATE OR REPLACE FUNCTION get_operator_complaints(p_operator_id INT)
RETURNS TABLE (
    complaintid INT,
    customername VARCHAR,
    bookingid INT,
    issuetype VARCHAR,
    description TEXT,
    status VARCHAR,
    createdat TIMESTAMP,
    tripdate DATE,
    startpoint VARCHAR,
    endpoint VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.ComplaintID as complaintid,
        cust.FullName as customername,
        c.BookingID as bookingid,
        c.IssueType as issuetype,
        c.Description as description,
        c.Status as status,
        c.CreatedAt as createdat,
        t.TripDate as tripdate,
        rt.StartPoint as startpoint,
        rt.EndPoint as endpoint
    FROM COMPLAINT c
    JOIN CUSTOMER cust ON c.CustomerID = cust.CustomerID
    JOIN BOOKING b ON c.BookingID = b.BookingID
    JOIN TRIP t ON b.TripID = t.TripID
    JOIN ROUTE rt ON t.RouteID = rt.RouteID
    WHERE t.OperatorID = p_operator_id
    ORDER BY c.CreatedAt DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. Update Complaint Status
CREATE OR REPLACE PROCEDURE update_complaint_status(
    p_complaint_id INT,
    p_operator_id INT,
    p_status VARCHAR,
    p_action_desc TEXT
) AS $$
BEGIN
    UPDATE COMPLAINT
    SET Status = p_status
    WHERE ComplaintID = p_complaint_id;

    INSERT INTO COMPLAINT_ACTIONS (ComplaintID, OperatorID, ActionDescription)
    VALUES (p_complaint_id, p_operator_id, p_action_desc);
END;
$$ LANGUAGE plpgsql;
