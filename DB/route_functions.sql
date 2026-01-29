-- Function to get all routes
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
