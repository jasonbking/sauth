-- Params:
-- $1 = name
-- $2 = uuid
INSERT INTO ${schema~}.accounts (name, acct_uuid)
    VALUES ($1, $2)
