-- AUTHENTICATION & USER MANAGEMENT

-- 1. Register Customer
CREATE OR REPLACE PROCEDURE register_customer(
    p_name VARCHAR,
    p_email VARCHAR,
    p_password TEXT,
    p_phone VARCHAR
) AS $$
BEGIN
    INSERT INTO CUSTOMER (FullName, Email, Password_Hash, Phone)
    VALUES (p_name, p_email, p_password, p_phone);
END;
$$ LANGUAGE plpgsql;

-- 2. Register Operator
CREATE OR REPLACE PROCEDURE register_operator(
    p_company VARCHAR,
    p_email VARCHAR,
    p_password TEXT,
    p_license VARCHAR
) AS $$
BEGIN
    INSERT INTO OPERATOR (CompanyName, AdminEmail, AdminPassword_Hash, LicenseNumber)
    VALUES (p_company, p_email, p_password, p_license);
END;
$$ LANGUAGE plpgsql;

-- 3. Customer Login Verification
-- Returns the Password_Hash if email exists
CREATE OR REPLACE FUNCTION verify_customer_login(p_email VARCHAR)
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

-- 4. Operator Login Verification
-- Returns the AdminPassword_Hash if email exists
CREATE OR REPLACE FUNCTION verify_operator_login(p_email VARCHAR)
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
-- 5. Get User Profile
CREATE OR REPLACE FUNCTION get_user_profile(p_user_id INT, p_role VARCHAR)
RETURNS TABLE (
    id INT,
    name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    joined TIMESTAMP,
    status VARCHAR
) AS $$
BEGIN
    IF p_role = 'customer' THEN
        RETURN QUERY
        SELECT CustomerID, FullName, Email, Phone, CreatedAt, 'Active'::VARCHAR
        FROM CUSTOMER WHERE CustomerID = p_user_id;
    ELSIF p_role = 'operator' THEN
        RETURN QUERY
        SELECT OperatorID, CompanyName, AdminEmail, NULL::VARCHAR, NULL::TIMESTAMP, Status
        FROM OPERATOR WHERE OperatorID = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
