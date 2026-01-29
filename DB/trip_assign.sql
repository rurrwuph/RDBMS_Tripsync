-- Procedure for TRIP ASSIGNMENT
-- Assign Trip
-- Validates if the operator owns the bus before assigning
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
    -- Check if operator owns the bus
    SELECT OperatorID INTO v_owner_id FROM BUS WHERE BusID = p_bus_id;
    
    IF v_owner_id IS NULL OR v_owner_id <> p_operator_id THEN
        RAISE EXCEPTION 'Operator does not own this bus or bus does not exist';
    END IF;

    INSERT INTO TRIP (OperatorID, RouteID, BusID, TripDate, DepartureTime, BaseFare)
    VALUES (p_operator_id, p_route_id, p_bus_id, p_trip_date, p_departure_time, p_fare);
    COMMIT;
END;
$$ LANGUAGE plpgsql;