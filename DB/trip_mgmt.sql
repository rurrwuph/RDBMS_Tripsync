-- TRIP & ROUTE MANAGEMENT

-- 1. Search Trips
CREATE OR REPLACE FUNCTION search_trips(p_start VARCHAR, p_end VARCHAR, p_date DATE)
RETURNS TABLE (
    TripID INT,
    CompanyName VARCHAR,
    BusType VARCHAR,
    DepartureTime TIME,
    BaseFare DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.TripID, o.CompanyName, b.BusType, t.DepartureTime, t.BaseFare
    FROM TRIP t
    JOIN OPERATOR o ON t.OperatorID = o.OperatorID
    JOIN BUS b ON t.BusID = b.BusID
    JOIN ROUTE r ON t.RouteID = r.RouteID
    WHERE r.StartPoint = p_start 
      AND r.EndPoint = p_end 
      AND t.TripDate = p_date;
END;
$$ LANGUAGE plpgsql;

-- 2. Get All Routes
CREATE OR REPLACE FUNCTION get_all_routes()
RETURNS TABLE (
    RouteID INT,
    StartPoint VARCHAR,
    EndPoint VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT r.RouteID, r.StartPoint, r.EndPoint
    FROM ROUTE r
    ORDER BY r.StartPoint, r.EndPoint;
END;
$$ LANGUAGE plpgsql;

-- 3. Assign New Trip (Operator)
CREATE OR REPLACE PROCEDURE assign_trip(
    p_operator_id INT,
    p_route_id INT,
    p_bus_id INT,
    p_trip_date DATE,
    p_departure_time TIME,
    p_fare DECIMAL
) AS $$
DECLARE
    v_owner_id INT;
BEGIN
    -- check if operator owns bus
    SELECT OperatorID INTO v_owner_id FROM BUS WHERE BusID = p_bus_id;
    
    IF v_owner_id IS NULL OR v_owner_id <> p_operator_id THEN
        RAISE EXCEPTION 'Operator does not own this bus or bus does not exist';
    END IF;

    INSERT INTO TRIP (OperatorID, RouteID, BusID, TripDate, DepartureTime, BaseFare)
    VALUES (p_operator_id, p_route_id, p_bus_id, p_trip_date, p_departure_time, p_fare);
END;
$$ LANGUAGE plpgsql;

-- 4. Get Trip Details
CREATE OR REPLACE FUNCTION get_trip_details(p_trip_id INT)
RETURNS TABLE (
    tripid INT,
    operatorid INT,
    routeid INT,
    busid INT,
    tripdate DATE,
    departuretime TIME,
    basefare DECIMAL(10, 2),
    bustype VARCHAR,
    companyname VARCHAR,
    startpoint VARCHAR,
    endpoint VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.TripID as tripid, t.OperatorID as operatorid, t.RouteID as routeid, t.BusID as busid, t.TripDate as tripdate, t.DepartureTime as departuretime, t.BaseFare as basefare, 
           b.BusType as bustype, o.CompanyName as companyname, r.StartPoint as startpoint, r.EndPoint as endpoint 
    FROM TRIP t
    JOIN BUS b ON t.BusID = b.BusID
    JOIN OPERATOR o ON t.OperatorID = o.OperatorID
    JOIN ROUTE r ON t.RouteID = r.RouteID
    WHERE t.TripID = p_trip_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Get Operator Recent Trips
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

-- 6. Archive Past Trips (Using Cursor)
CREATE OR REPLACE FUNCTION archive_past_trips() 
RETURNS VOID AS $$
DECLARE
    trip_cursor CURSOR FOR 
        SELECT * FROM TRIP 
        WHERE (TripDate < CURRENT_DATE) 
           OR (TripDate = CURRENT_DATE AND DepartureTime < CURRENT_TIME);
    rec TRIP%ROWTYPE;
BEGIN
    OPEN trip_cursor;
    LOOP
        FETCH trip_cursor INTO rec;
        EXIT WHEN NOT FOUND;
        
        -- Save to log
        INSERT INTO PAST_TRIPS_LOG (TripID, OperatorID, RouteID, BusID, TripDate, DepartureTime, BaseFare)
        VALUES (rec.TripID, rec.OperatorID, rec.RouteID, rec.BusID, rec.TripDate, rec.DepartureTime, rec.BaseFare);
        
        -- Remove from active trips (Note: This will cascade to bookings if not handled)
        DELETE FROM TRIP WHERE TripID = rec.TripID;
    END LOOP;
    CLOSE trip_cursor;
END;
$$ LANGUAGE plpgsql;

-- 7. Get Operator Past Trips
CREATE OR REPLACE FUNCTION get_operator_past_trips(p_operator_id INT)
RETURNS TABLE (
    tripid INT,
    tripdate DATE,
    departuretime TIME,
    basefare DECIMAL(10, 2),
    busnumber VARCHAR,
    bustype VARCHAR,
    startpoint VARCHAR,
    endpoint VARCHAR,
    archivedat TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.TripID as tripid, p.TripDate as tripdate, p.DepartureTime as departuretime, p.BaseFare as basefare, 
           b.BusNumber as busnumber, b.BusType as bustype, 
           r.StartPoint as startpoint, r.EndPoint as endpoint,
           p.ArchivedAt as archivedat
    FROM PAST_TRIPS_LOG p
    JOIN BUS b ON p.BusID = b.BusID
    JOIN ROUTE r ON p.RouteID = r.RouteID
    WHERE p.OperatorID = p_operator_id
    ORDER BY p.TripDate DESC, p.DepartureTime DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;


