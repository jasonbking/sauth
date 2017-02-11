-- Params:
-- $1 = accountUuid
-- $2 = userUuid
SELECT a.acct_uuid acctUuid
      ,u.user_uuid userUuid
      ,u.login
      ,u.name
  FROM ${schema~}.users u
      ,${schema~}.accounts a
 WHERE u.acct_id = a.id
   AND u.user_uuid = $2
   AND a.acct_uuid = $1
