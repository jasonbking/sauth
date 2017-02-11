-- Params:
-- $1 = accountUuid
-- $2 = userUuid
SELECT 'user' source
      ,$2 source_uuid
      ,ur.rule_uuid
      ,ur.rule
  FROM ${schema~}.user_rules ur
      ,${schema~}.users u
 WHERE ur.user_id = u.id
   AND u.user_uuid = $2
UNION
SELECT 'group' source
      ,g.group_uuid source_uuid
      ,gr.rule_uuid
      ,gr.rule
  FROM ${schema~}.group_rules gr
      ,${schema~}.groups g
      ,${schema~}.users u
      ,${schema~}.user_groups ug
      ,${schema~}.accounts a
 WHERE gr.group_id = g.id
   AND u.id = ug.user_id
   AND g.id = ug.group_id
   AND u.user_uuid = $2
   AND u.acct_id = a.id
   AND a.acct_uuid = $1
