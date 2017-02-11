-- Params:
-- $1 = accountUuid
-- $2 = userUuid
-- $3 = groupUuid
INSERT INTO ${schema~}.user_groups(user_id, group_id)
    VALUES ((SELECT u.id
               FROM ${schema~}.users
              WHERE u.user_uuid = $2),
            (SELECT g.id
               FROM ${schema~}.groups g
                   ,${schema~}.accounts a
              WHERE a.id = g.acct_id
                AND a.acct_uuid = $1
                AND g.group_uuid = $2))
