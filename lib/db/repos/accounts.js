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
			var acct = {
				name: name,
				acctUuid: uuid.v4()
			};

			return rep.none(sql.add, [acct.name, acct.acctUuid])
				.then(function (data) {
					return acct;
				});
		},

		remove: function (a_uuid) {
			return rep.result(sql.remove, a_uuid,
				function (r) {
					return r.rowCount;
				});
		},

		find: function (a_uuid) {
			return rep.oneOrNone(sql.find, a_uuid)
				.then(function (data) {
					return (data === null) ? {} : data;
				});
		},

		all: function () {
			return rep.any(sql.all);
		}
	};
};
