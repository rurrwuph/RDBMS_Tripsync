-- PROCEDURES FOR REGISTRATION 

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
    COMMIT;
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
    COMMIT;
END;
$$ LANGUAGE plpgsql;


