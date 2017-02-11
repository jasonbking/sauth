-- Parameters:
-- $1 = accountUuid
-- $2 = userUuid
SELECT g.group_uuid groupUuid
      ,g.name
  FROM ${schema~}.groups g
      ,${schema~}.accounts a
      ,${schema~}.user_groups ug
      ,${schema~}.users u
 WHERE ug.group_id = g.id
   AND ug.user_id = u.id
   AND u.user_uuid = $2
   AND u.account_id = a.id
   AND a.acct_uuid = $1
