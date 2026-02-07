--get trip details
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
