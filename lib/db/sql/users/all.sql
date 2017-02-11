-- Params:
-- $1 = accountUuid
SELECT a.acct_uuid acctUuid
      ,u.user_uuid userUuid
      ,u.login
      ,u.name
  FROM ${schema~}.accounts a
      ,${schema~}.users u
 WHERE a.id = u.acct_id
   AND a.acct_uuid = $1
