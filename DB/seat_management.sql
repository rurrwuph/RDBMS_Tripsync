-- TRIGGERS FOR AUTOMATED SEAT MANAGEMENT

-- 1. Trigger Function to create seats for a new bus
CREATE OR REPLACE FUNCTION tg_create_bus_seats()
RETURNS TRIGGER AS $$
DECLARE
    i INT;
    v_seat_num VARCHAR;
    v_rows INT;
BEGIN
    -- Basic logic: Rows A-Z, 4 seats per row (Window, Aisle, Aisle, Window)
    v_rows := CEIL(NEW.TotalSeats::DECIMAL / 4);
    
    FOR i IN 1..NEW.TotalSeats LOOP
        -- Simple seat numbering: 1, 2, 3...
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

-- 2. Create the Trigger
CREATE TRIGGER after_bus_insert
AFTER INSERT ON BUS
FOR EACH ROW
EXECUTE FUNCTION tg_create_bus_seats();
