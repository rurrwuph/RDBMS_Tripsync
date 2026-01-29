-- Search Trips
-- returns table of trips matching the start point, end point, and date
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