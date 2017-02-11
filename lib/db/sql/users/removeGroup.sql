-- Params:
-- $1 = accountUuid
-- $2 = userUuid
-- $3 = groupUuid
DELETE FROM ${schema~}.user_group ug
  WHERE ug.user_id IN (SELECT id
                         FROM ${schema~}.users u
                             ,${schema~}.accounts a
                        WHERE u.user_uuid = $2
                          AND u.acct_id = a.id
                          AND a.acct_uuid = $1)
    AND ug.group_id IN (SELECT id
                          FROM ${schema~}.groups g
                              ,${schema~}.accounts a
                         WHERE g.group_uuid = $3
                           AND g.account_id = a.id
                           AND a.acct_uuid = $1)
