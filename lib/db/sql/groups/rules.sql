-- Params:
-- $1 - accountUuid
-- $2 - groupUuid
SELECT  gr.rule_uuid
       ,gr.rule
  FROM  ${schema~}.group_rules gr
       ,${schema~}.groups g
       ,${schema~}.accounts a
 WHERE gr.group_id = g.id
   AND g.account_id = a.id
   AND a.acct_uuid = $1
   AND g.group_uuid = $2
