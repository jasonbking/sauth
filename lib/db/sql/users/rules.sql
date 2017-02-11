-- Params:
-- $1 = accountUuid
-- $2 = userUuid
SELECT ur.rule_uuid
      ,ur.rule
  FROM ${schema~}.user_rules ur
      ,${schema~}.users u
      ,${schema~}.accounts a
 WHERE ur.user_id = u.id
   AND u.acct_id = a.id
   AND u.user_uuid = $2
   AND a.acct_uuid = $1
