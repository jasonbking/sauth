'use strict';
// vim:ts=4:sw=4:et:
/*
 * Code to add/remove/find accounts
 */
var sql = require('../sql').accounts;
var uuid = require('node-uuid');

module.exports = (rep, pgp) => {
    return {
        add: name =>
            rep.one(sql.add, [ name, uuid.v4() ],
                a => {
                        return {
                            accountUuid: a.acct_uuid,
                            name: name
                        };
                }),

        remove: a_uuid =>
            rep.result(sql.remove, a_uuid, r => r.rowCount),

        find: a_uuid =>
            rep.oneOrNone(sql.find, a_uuid),

        all: () =>
            rep.any(sql.all),
    };
};

