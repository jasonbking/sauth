// vim:ts=4:sw=4:
/*
 * Code to add/remove/find accounts
 */
var sql = require('../sql').accounts;
var sqlUser = require('../sql').users;
var uuid = require('node-uuid');

module.exports = function (rep, pgp) {
	return {
		// jsl doesn't seem to like => functions, so these are a bit
		// more verbose

		add: function (name) {
			var acct = {
				name: name,
				accountUuid: uuid.v4()
			};

			var admin = {
				accountUuid: acct.accountUuid,
				userUuid: uuid.v4(),
				login: 'admin',
				name: 'Administrator',
			};

			var adminRule = {
				ruleUuid: uuid.v4(),
				rule: 'CAN * anything'
			};

			acct.admin = admin;
			acct.admin.rule = adminRule;

			return rep.tx(function (t) {
				var q1 = t.none(sql.add, [acct.name, acct.accountUuid]);
				var q2 = t.none(sqlUser.add, admin);
				var q3 = t.none(sqlUser.addRule,
					[acct.accountUuid, admin.userUuid, adminRule.ruleUuid,
					adminRule.rule]);

				return t.batch([q1, q2, q3]);
			}).then(function () {
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
