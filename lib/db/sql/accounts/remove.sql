-- Params:
-- $1 = accountUuid
DELETE FROM ${schema~}.accounts WHERE acct_uuid = $1
