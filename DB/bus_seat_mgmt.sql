-- BUS & SEAT MANAGEMENT

-- 1. Get Operator's Buses
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

-- 2. Add New Bus
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

-- 3. Trigger Function: Generate Seats for a Bus (Automated)
CREATE OR REPLACE FUNCTION tg_create_bus_seats()
RETURNS TRIGGER AS $$
DECLARE
    i INT;
    v_seat_num VARCHAR;
BEGIN
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

DROP TRIGGER IF EXISTS after_bus_insert ON BUS;
CREATE TRIGGER after_bus_insert
AFTER INSERT ON BUS
FOR EACH ROW
EXECUTE FUNCTION tg_create_bus_seats();

-- 4. Get Trip Seat Map
CREATE OR REPLACE FUNCTION get_trip_seat_map(p_trip_id INT)
RETURNS TABLE (
    seatid INT,
    seatnumber VARCHAR,
    seattype VARCHAR,
    isbooked BOOLEAN
) AS $$
DECLARE
    v_bus_id INT;
BEGIN
    SELECT BusID INTO v_bus_id FROM TRIP WHERE TripID = p_trip_id;

    RETURN QUERY
    SELECT 
        s.SeatID as seatid, 
        s.SeatNumber as seatnumber, 
        s.SeatType as seattype, 
        CASE 
            WHEN b.BookingID IS NOT NULL AND b.BookingStatus IN ('Confirmed', 'Pending') THEN true 
            ELSE false 
        END as isbooked
    FROM SEAT s
    LEFT JOIN BOOKING b ON s.SeatID = b.SeatID AND b.TripID = p_trip_id AND b.BookingStatus != 'Cancelled'
    WHERE s.BusID = v_bus_id
    ORDER BY CAST(SUBSTRING(s.SeatNumber FROM '[0-9]+') AS INT);
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger Function: Prevent Double Booking
CREATE OR REPLACE FUNCTION tg_prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM BOOKING 
        WHERE TripID = NEW.TripID 
        AND SeatID = NEW.SeatID 
        AND BookingStatus IN ('Confirmed', 'Pending', 'RefundRequested') 
    ) THEN
        RAISE EXCEPTION 'Constraint Violation: Seat % is already taken or reserved for Trip %', NEW.SeatID, NEW.TripID;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_seat_availability ON BOOKING;
CREATE TRIGGER trg_check_seat_availability
BEFORE INSERT ON BOOKING
FOR EACH ROW
EXECUTE FUNCTION tg_prevent_double_booking();
