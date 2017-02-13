-- Params:
-- $1 = accountUuid
SELECT acct_uuid accountUuid
      ,name
  FROM ${schema~}.accounts a
 WHERE a.acct_uuid = $1
