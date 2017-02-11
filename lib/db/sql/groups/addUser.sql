-- Params are:
-- $1 = accountUuid
-- $2 = groupUuid
-- $3 = userUuid
INSERT INTO ${schema~}.user_groups(user_id, group_id)
    VALUES((SELECT u.id
              FROM ${schema~}.users u
             WHERE u.user_uuid = $3),
           (SELECT g.id
              FROM ${schema~}.groups g
                   ,${schema~}.accounts a
             WHERE g.group_uuid = $2
               AND a.acct_uuid = $1))
