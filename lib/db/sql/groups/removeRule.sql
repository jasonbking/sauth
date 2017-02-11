-- Params:
-- $1 = accountUuid
-- $2 = ruleUuid
DELETE FROM ${schema~}.group_rules gr
       WHERE gr.rule_uuid = $1
         AND gr.group_id IN (SELECT g.id
                              FROM ${schema~}.groups g
                                  ,${schema~}.accounts a
                             WHERE g.acctount_id = a.id
                               AND a.acct_uuid = $1)
