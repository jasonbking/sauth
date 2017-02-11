-- Param is:
-- group {
--   accountUuid: ..
--   groupUuid: ...
--   name: ...
-- }

INSERT INTO ${schema~}.groups (group_uuid, account_id, name)
    VALUES (${groupUuid},
            (SELECT a.id
               FROM ${schema~}.accounts a
              WHERE a.acct_uuid = ${accountUuid}),
            ${name})
    RETURNING group_uuid groupUuid
