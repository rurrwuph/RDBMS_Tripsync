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

-- 2. Operator Login Verification
-- Returns OperatorID if email and password match, else NULL
CREATE OR REPLACE FUNCTION verify_operator_login(p_email VARCHAR, p_password TEXT)
RETURNS INT AS $$
DECLARE
    v_operator_id INT;
BEGIN
    SELECT OperatorID INTO v_operator_id
    FROM OPERATOR
    WHERE AdminEmail = p_email AND AdminPassword_Hash = p_password;
    
    RETURN v_operator_id;
END;
$$ LANGUAGE plpgsql;


