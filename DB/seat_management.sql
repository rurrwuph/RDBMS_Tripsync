-- TRIGGERS FOR AUTOMATED SEAT MANAGEMENT

-- 1. Trigger Function to create seats for a new bus
CREATE OR REPLACE FUNCTION tg_create_bus_seats()
RETURNS TRIGGER AS $$
DECLARE
    i INT;
    v_seat_num VARCHAR;
BEGIN
    -- Basic logic: Rows A-Z, 4 seats per row (Window, Aisle, Aisle, Window)
    
    FOR i IN 1..NEW.TotalSeats LOOP
        v_seat_num := 'S' || i;
        
        INSERT INTO SEAT (BusID, SeatNumber, SeatType)
        VALUES (
            NEW.BusID, 
            v_seat_num, 
            CASE WHEN i % 4 IN (1, 0) THEN 'Window' ELSE 'Aisle' END
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_bus_insert
AFTER INSERT ON BUS
FOR EACH ROW
EXECUTE FUNCTION tg_create_bus_seats();


-- 2. Trigger Function to prevent double booking

CREATE OR REPLACE FUNCTION tg_prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if seat is already occupied for this trip
    IF EXISTS (
        SELECT 1 FROM BOOKING 
        WHERE TripID = NEW.TripID 
        AND SeatID = NEW.SeatID 
        AND BookingStatus = 'Confirmed'
    ) THEN
        RAISE EXCEPTION 'Constraint Violation: Seat % is already taken for Trip %', NEW.SeatID, NEW.TripID;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_seat_availability
BEFORE INSERT ON BOOKING
FOR EACH ROW
EXECUTE FUNCTION tg_prevent_double_booking();

-- 3
CREATE OR REPLACE FUNCTION get_trip_seat_map(p_trip_id INT)
RETURNS TABLE (
    seat_id INT,
    seat_number VARCHAR,
    seat_type VARCHAR,
    is_booked BOOLEAN
) AS $$
DECLARE
    v_bus_id INT;
BEGIN
    SELECT BusID INTO v_bus_id FROM TRIP WHERE TripID = p_trip_id;

    RETURN QUERY
    SELECT 
        s.SeatID, 
        s.SeatNumber, 
        s.SeatType, 
        CASE 
            WHEN b.BookingID IS NOT NULL AND b.BookingStatus = 'Confirmed' THEN true 
            ELSE false 
        END
    FROM SEAT s
    LEFT JOIN BOOKING b ON s.SeatID = b.SeatID AND b.TripID = p_trip_id
    WHERE s.BusID = v_bus_id
    ORDER BY CAST(SUBSTRING(s.SeatNumber FROM '[0-9]+') AS INT);
END;
$$ LANGUAGE plpgsql;