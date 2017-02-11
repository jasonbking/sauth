-- Params are:
-- $1 = accountUuid
-- $2 = groupUuid
SELECT  a.acct_uuid acctUuid
       ,g.group_uuid groupUuid
       ,g.name
  FROM  ${schema~}.accounts a
       ,${schema~}.groups g
 WHERE a.id = g.account_id
   AND a.acct_uuid = $1
   AND g.group_uuid = $2
