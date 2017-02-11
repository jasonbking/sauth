-- Params are:
-- $1 = accountUuid
-- $2 = groupUuid
-- $3 = userUuid
DELETE FROM ${schema~}.user_groups ug
 WHERE ug.user_id IN (SELECT id
                       FROM ${schema~}.users
                      WHERE user_uuid = $3)
   AND ug.group_id IN (SELECT id
                        FROM ${schema~}.groups
                      WHERE group_uuid = $2)
