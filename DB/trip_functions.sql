--get trip details
CREATE OR REPLACE FUNCTION get_trip_details(p_trip_id INT)
RETURNS TABLE (
    TripID INT,
    OperatorID INT,
    RouteID INT,
    BusID INT,
    TripDate DATE,
    DepartureTime TIME,
    BaseFare DECIMAL(10, 2),
    BusType VARCHAR,
    CompanyName VARCHAR,
    StartPoint VARCHAR,
    EndPoint VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.TripID, t.OperatorID, t.RouteID, t.BusID, t.TripDate, t.DepartureTime, t.BaseFare, 
           b.BusType, o.CompanyName, r.StartPoint, r.EndPoint 
    FROM TRIP t
    JOIN BUS b ON t.BusID = b.BusID
    JOIN OPERATOR o ON t.OperatorID = o.OperatorID
    JOIN ROUTE r ON t.RouteID = r.RouteID
    WHERE t.TripID = p_trip_id;
END;
$$ LANGUAGE plpgsql;
