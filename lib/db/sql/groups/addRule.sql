-- Params:
-- $1 = accountUuid
-- $2 = groupUuid
-- $3 = ruleUuid
-- $4 = rule
INSERT INTO ${schema~}.group_rules(group_id, rule_uuid, rule)
    VALUES ((SELECT u.id
               FROM ${schema~}.groups g
                   ,${schema~}.accounts a
              WHERE g.acct_id = a.id
                AND a.acct_uuid = $1
                AND g.group_uuid = $2),
             $3, 4)
    RETURNING rule_uuid
