SELECT t.TripID, t.TripDate, t.DepartureTime, t.BaseFare, 
       b.BusNumber, b.BusType, 
       r.StartPoint, r.EndPoint 
FROM TRIP t
JOIN BUS b ON t.BusID = b.BusID
JOIN ROUTE r ON t.RouteID = r.RouteID
WHERE t.OperatorID = $1
ORDER BY t.TripDate DESC, t.DepartureTime DESC
LIMIT 10;
