INSERT INTO BUS (OperatorID, BusNumber, BusType, TotalSeats) 
VALUES ($1, $2, $3, $4) RETURNING *;
