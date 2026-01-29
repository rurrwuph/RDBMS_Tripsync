--operator's recent trips
CREATE OR REPLACE FUNCTION get_operator_trips(p_operator_id INT)
RETURNS TABLE (
    TripID INT,
    TripDate DATE,
    DepartureTime TIME,
    BaseFare DECIMAL(10, 2),
    BusNumber VARCHAR,
    BusType VARCHAR,
    StartPoint VARCHAR,
    EndPoint VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.TripID, t.TripDate, t.DepartureTime, t.BaseFare, 
           b.BusNumber, b.BusType, 
           r.StartPoint, r.EndPoint 
    FROM TRIP t
    JOIN BUS b ON t.BusID = b.BusID
    JOIN ROUTE r ON t.RouteID = r.RouteID
    WHERE t.OperatorID = p_operator_id
    ORDER BY t.TripDate DESC, t.DepartureTime DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- operator stats
CREATE OR REPLACE FUNCTION get_operator_stats(p_operator_id INT)
RETURNS TABLE (
    total_buses BIGINT,
    active_trips BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM BUS WHERE OperatorID = p_operator_id),
        (SELECT COUNT(*) FROM TRIP WHERE OperatorID = p_operator_id AND TripDate >= CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- operator's buses
CREATE OR REPLACE FUNCTION get_operator_buses(p_operator_id INT)
RETURNS TABLE (
    BusID INT,
    OperatorID INT,
    BusNumber VARCHAR,
    BusType VARCHAR,
    TotalSeats INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT b.BusID, b.OperatorID, b.BusNumber, b.BusType, b.TotalSeats
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
