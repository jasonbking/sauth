'use strict'

// vim:ts=4:sw=4:
/*
 * Code to add/remove/find accounts
 */
var sql = require('../sql').accounts;
var uuid = require('node-uuid');

module.exports = function (rep, pgp) {
	return {
		// jsl doesn't seem to like => functions, so these are a bit
		// more verbose

		add: function (name) {
			return rep.one(sql.add, [ name, uuid.v4() ], a => ({accountUuid: a.acct_uuid, name});
		},

		remove: function (a_uuid) {
			return rep.result(sql.remove, a_uuid, a => a.rowCount);
		},

		find: function (a_uuid) {
			return rep.oneOrNone(sql.find, a_uuid, a => a && {});
		},

		all: function () {
			return rep.any(sql.all);
		}
	};
};
