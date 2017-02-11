// vim:ts=4:sw=4:et:

/*
 * The functions to manipulate users.  As with groups, all user manipulations
 * are restricted by the account UUID that is given to server as a last-resort
 * check on preventing manipulating objects in a different account.
 */

'use strict';

var sql = require('../sql').users;
var uuid = require('node-uuid');

module.exports = (rep, pgp) => {
    return {
        add: (accountUuid, name, login, groups) => {
            var user = {
                accountUuid: accountUuid,
                userUuid: uuid.v4(),
                login: login,
                name: name
            };

            // allow an optional list of groups (must already exist)
            // to put the user in
            var ga = [].concat(groups || []);

            // Explicitly do the add as a transaction so that
            // the user creation as well as group update can
            // happen atomically, and allow us to not have to
            // worry about cleanup of any partial operations
            return rep.tx(t => {
                var queries = [];

                // INSERT into users
                queries.push(t.none(sql.add, user));

                // INSERTs into user_group if needed
                ga.forEach(groupUuid =>
                    queries.push(t.none(sql.addGroup,
                        [ accountUuid, userUuid, groupUuid ])));

                return t.batch(queries);
                // XXX: It'd be nice to return the
                // resulting user JSON
            });
        },

        addGroup: (accountUuid, userUuid, groupUuid) =>
            rep.none(sql.addGroup, [ accountUuid, userUuid, groupUuid ]),

        removeGroup: (accountUuid, userUuid, groupUuid) =>
            rep.result(sql.removeGroup, [ accountUuid, userUuid, groupUuid ],
                r => r.rowCount),

        groups: (accountUuid, userUuid) =>
            rep.any(sql.groups, [ accountUuid, userUuid ]),

        remove: (accountUuid, userUuid) =>
            rep.result(sql.remove, [ accountUuid, userUuid ], r => r.rowCount),

        // XXX should find / all also return list of groups??
        find: (accountUuid, userUuid) =>
            rep.oneOrNone(sql.find, [ accountUuid, userUuid]),

        all: (accountUuid) =>
            rep.any(sql.all, accountUuid),

        // list all the rules defined explicity for a given user
        rules: (accountUuid, userUuid) =>
            rep.any(sql.rules, [ accountUuid, userUuid ]),

        // user user-defined and any rules defined for any groups
        // the user is a member in
        allRules: (accountUuid, userUuid) =>
            rep.any(sql.allRules, [ accountUuid, userUuid ]),

        addRule: (accountUuid, userUuid, rule) =>
            rep.one(sql.addRule, [ accountUuid, userUuid, uuid.v4(), rule ],
                r => r.ruleUuid),

        removeRule: (accountUuid, ruleUuid) =>
            rep.result(sql.removeRule, [ accountUuid, ruleUuid ],
                r => r.rowCount),

    };
};

