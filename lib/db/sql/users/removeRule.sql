-- Params:
-- $1 = accountUuid
-- $2 = ruleUuid
DELETE FROM ${schema~}.user_rules ur
       WHERE ur.rule_uuid = $2
         AND ur.user_id IN (SELECT u.id
                              FROM ${schema~}.users u
                                  ,${schema~}.accounts a
                             WHERE u.acct_id = a.id
                               AND a.acct_uuid = $1)
