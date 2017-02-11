-- Params are:
-- $1 = accountUuid
SELECT  a.acct_uuid acctUuid
       ,g.group_uuid groupUuid
       ,g.name
  FROM  ${schema~}.accounts a
       ,${schema~}.groups g
 WHERE a.id = g.account_id
   AND a.acct_uuid = $1
