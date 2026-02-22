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
