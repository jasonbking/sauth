// vim:ts=4:sw=4:et:
/*
 * Like the user repo, all group operations must include an account
 * uuid as a last resort check to prevent manipulating of a group
 * outside of a given account.
 */
'use strict';

var sql = require('../sql').groups;
var uuid = require('node-uuid');

module.exports = (rep, pgp) => {
    return {
        // Add a group and an optional list of (existing) users
        add: (accountUuid, name, users) => {
            var group = {
                accountUuid: accountUuid,
                groupUuid: uuid.v4(),
                name: name
            };

            var ua = [].concat(users || []);

            return rep.tx(t => {
                var queries = [];

                // INSERT into groups
                queries.push(t.one(sql.add, group, r => r));

                // INSERTs into user_group if needed
                ua.forEach(userUuid =>
                    queries.push(t.none(sql.addUser,
                        [ accountUuid, group.groupUuid, userUuid ])));

                return t.batch(queries);
            });
        },

        addUser: (accountUuid, groupUuid, userUuid) =>
            rep.none(sql.addUser, [ accountUuid, groupUuid, userUuid ]),

        removeUser: (accountUuid, groupUuid, userUuid) =>
            rep.result(sql.removeUser, [ accountUuid, groupUuid, userUuid ],
                r => r.rowCount),

        remove: (accountUuid, groupUuid) =>
            rep.result(sql.remove, [ accountUuid, groupUuid ], r => r.rowCount),

        find: (accountUuid, groupUuid) =>
            rep.oneOrNone(sql.find, [ accountUuid, groupUuid ]),

        all: (accountUuid) =>
            rep.any(sql.all, accountUuid),

        rules: (accountUuid, groupUuid) =>
            rep.any(sql.rules, [ accountUuid, groupUuid ]),

        addRule: (accountUuid, rule) =>
            rep.one(sql.addRule, [ accountUuid, rule ], r => r.ruleUuid),

        removeRule: (accountUuid, ruleUuid) =>
            rep.result(sql.removeRule, [ accountUuid, ruleUuid ],
                r => r.rowCount),
    };
};
