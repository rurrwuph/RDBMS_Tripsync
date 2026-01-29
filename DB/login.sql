-- -- 1. Customer Login Verification
-- -- Returns CustomerID if email and password match, else NULL
-- CREATE OR REPLACE FUNCTION verify_customer_login(p_email VARCHAR, p_password TEXT)
-- RETURNS INT AS $$
-- DECLARE
--     v_customer_id INT;
-- BEGIN
--     SELECT CustomerID INTO v_customer_id
--     FROM CUSTOMER
--     WHERE Email = p_email AND Password_Hash = p_password;
    
--     RETURN v_customer_id;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- 2. Operator Login Verification
-- -- Returns OperatorID if email and password match, else NULL
-- CREATE OR REPLACE FUNCTION verify_operator_login(p_email VARCHAR, p_password TEXT)
-- RETURNS INT AS $$
-- DECLARE
--     v_operator_id INT;
-- BEGIN
--     SELECT OperatorID INTO v_operator_id
--     FROM OPERATOR
--     WHERE AdminEmail = p_email AND AdminPassword_Hash = p_password;
    
--     RETURN v_operator_id;
-- END;
-- $$ LANGUAGE plpgsql;


-- 1. Customer Login Verification
-- Returns the Password_Hash if email exists
CREATE OR REPLACE FUNCTION verify_customer_login(p_email VARCHAR, p_password TEXT)
RETURNS TEXT AS $$
DECLARE
    v_hash TEXT;
BEGIN
    SELECT Password_Hash INTO v_hash
    FROM CUSTOMER
    WHERE Email = p_email;
    
    RETURN v_hash;
END;
$$ LANGUAGE plpgsql;

-- 2. Operator Login Verification
-- Returns the AdminPassword_Hash if email exists
CREATE OR REPLACE FUNCTION verify_operator_login(p_email VARCHAR, p_password TEXT)
RETURNS TEXT AS $$
DECLARE
    v_hash TEXT;
BEGIN
    SELECT AdminPassword_Hash INTO v_hash
    FROM OPERATOR
    WHERE AdminEmail = p_email;
    
    RETURN v_hash;
END;
$$ LANGUAGE plpgsql;