-- Params:
-- $1 = accountUuid
-- $2 = userUuid
DELETE FROM ${schema~}.users u
  WHERE u.user_uuid = $2
    AND u.acct_id IN (SELECT id
                        FROM ${schema~}.accounts a
                       WHERE a.acct_uuid = $1)
