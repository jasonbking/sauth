-- Params are:
-- $1 = accountUuid
-- $2 = groupUuid
DELETE FROM ${schema~}.groups g
 WHERE g.group_uuid = $2
   AND g.account_id IN (SELECT id
                          FROM ${schema~}.accounts
                         WHERE acct_uuid = $1)
