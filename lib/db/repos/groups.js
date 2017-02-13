// vim:ts=4:sw=4:
/*
 * Like the user repo, all group operations must include an account
 * uuid as a last resort check to prevent manipulating of a group
 * outside of a given account.
 */
var sql = require('../sql').groups;
var uuid = require('node-uuid');

module.exports = function (rep, pgp) {
	return {
		// Add a group and an optional list of (existing) users
		add: function (accountUuid, name, users) {
			var ua = [].concat(users || []);

			var group = {
				accountUuid: accountUuid,
				groupUuid: uuid.v4(),
				name: name,
				users: ua
			};

			return rep.tx(function (t) {
				var queries = [];

				// INSERT into groups
				queries.push(t.none(sql.add, group));

				// INSERTs into user_group if needed
				ua.forEach(function (userUuid) {
					queries.push(t.none(sql.addUser,
						[ accountUuid, group.groupUuid, userUuid ]));
				});

				return t.batch(queries);
			})
			.then(function () {
				return group;
			});
		},

		addUser: function (accountUuid, groupUuid, userUuid) {
			return rep.none(sql.addUser, [ accountUuid, groupUuid, userUuid ]);
		},

		removeUser: function (accountUuid, groupUuid, userUuid) {
			return rep.result(sql.removeUser,
				[ accountUuid, groupUuid, userUuid ],
				function (r) {
					return r.rowCount;
				});
		},

		remove: function (accountUuid, groupUuid) {
			return rep.result(sql.remove, [ accountUuid, groupUuid ],
				function (r) {
					return r.rowCount;
				});
		},

		find: function (accountUuid, groupUuid) {
			return rep.oneOrNone(sql.find, [ accountUuid, groupUuid ]);
		},

		all: function (accountUuid) {
			return rep.any(sql.all, accountUuid);
		},

		rules: function (accountUuid, groupUuid) {
			return rep.any(sql.rules, [ accountUuid, groupUuid ]);
		},

		addRule: function (accountUuid, groupUuid, rule) {
			return rep.one(sql.addRule,
				[ accountUuid, groupUuid, uuid.v4(), rule ])
				.then(function (data) {
					return {
						ruleUuid: data.rule_uuid,
						rule: data.rule
					};
				});
		},

		removeRule: function (accountUuid, ruleUuid) {
			return rep.result(sql.removeRule, [ accountUuid, ruleUuid ],
				function (r) {
					return r.rowCount;
				});
		}
	};
};
