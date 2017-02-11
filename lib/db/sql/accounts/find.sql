-- Params:
-- $1 = accountUuid
SELECT acct_uuid acctUuid
      ,name
  FROM ${schema~}.accounts a
 WHERE a.acct_uuid = $1
