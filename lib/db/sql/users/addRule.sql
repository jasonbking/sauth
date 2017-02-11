-- Params:
-- $1 = accountUuid
-- $2 = userUuid
-- $3 = ruleUuid
-- $4 = rule
INSERT INTO ${schema~}.user_rules(user_id, rule_uuid, rule)
    VALUES ((SELECT u.id
               FROM ${schema~}.users u
                   ,${schema~}.accounts a
              WHERE u.acct_id = a.id
                AND a.acct_uuid = $1
                AND u.user_uuid = $2),
             $3, $4)
    RETURNING rule_uuid
