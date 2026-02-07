--operator's recent trips
CREATE OR REPLACE FUNCTION get_operator_trips(p_operator_id INT)
RETURNS TABLE (
    tripid INT,
    tripdate DATE,
    departuretime TIME,
    basefare DECIMAL(10, 2),
    busnumber VARCHAR,
    bustype VARCHAR,
    startpoint VARCHAR,
    endpoint VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.TripID as tripid, t.TripDate as tripdate, t.DepartureTime as departuretime, t.BaseFare as basefare, 
           b.BusNumber as busnumber, b.BusType as bustype, 
           r.StartPoint as startpoint, r.EndPoint as endpoint 
    FROM TRIP t
    JOIN BUS b ON t.BusID = b.BusID
    JOIN ROUTE r ON t.RouteID = r.RouteID
    WHERE t.OperatorID = p_operator_id
    ORDER BY t.TripDate DESC, t.DepartureTime DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- operator stats
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

-- operator's buses
CREATE OR REPLACE FUNCTION get_operator_buses(p_operator_id INT)
RETURNS TABLE (
    busid INT,
    operatorid INT,
    busnumber VARCHAR,
    bustype VARCHAR,
    totalseats INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT b.BusID as busid, b.OperatorID as operatorid, b.BusNumber as busnumber, b.BusType as bustype, b.TotalSeats as totalseats
    FROM BUS b
    WHERE b.OperatorID = p_operator_id
    ORDER BY b.BusID DESC;
END;
$$ LANGUAGE plpgsql;

-- add a bus
CREATE OR REPLACE PROCEDURE add_bus(
    p_operator_id INT,
    p_bus_number VARCHAR,
    p_bus_type VARCHAR,
    p_total_seats INT,
    INOUT p_bus_id INT DEFAULT NULL
) AS $$
BEGIN
    INSERT INTO BUS (OperatorID, BusNumber, BusType, TotalSeats)
    VALUES (p_operator_id, p_bus_number, p_bus_type, p_total_seats)
    RETURNING BusID INTO p_bus_id;
END;
$$ LANGUAGE plpgsql;
