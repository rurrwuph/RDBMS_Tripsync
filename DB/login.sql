-- 1. Customer Login Verification
-- Returns CustomerID if email and password match, else NULL
CREATE OR REPLACE FUNCTION verify_customer_login(p_email VARCHAR, p_password TEXT)
RETURNS INT AS $$
DECLARE
    v_customer_id INT;
BEGIN
    SELECT CustomerID INTO v_customer_id
    FROM CUSTOMER
    WHERE Email = p_email AND Password_Hash = p_password;
    
    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql;




