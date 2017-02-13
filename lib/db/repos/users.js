// vim:ts=4:sw=4:

/*
 * The functions to manipulate users.  As with groups, all user manipulations
 * are restricted by the account UUID that is given to server as a last-resort
 * check on preventing manipulating objects in a different account.
 */
var sql = require('../sql').users;
var uuid = require('node-uuid');

module.exports = function (rep, pgp) {
	return {
		add: function (accountUuid, name, login, groups) {
			// allow an optional list of groups (must already exist)
			// to put the user in
			var ga = [].concat(groups || []);

			var user = {
				accountUuid: accountUuid,
				userUuid: uuid.v4(),
				login: login,
				name: name,
				groups: ga
			};

			// Explicitly do the add as a transaction so that
			// the user creation as well as group update can
			// happen atomically, and allow us to not have to
			// worry about cleanup of any partial operations
			return rep.tx(function (t) {
				var queries = [];

				// INSERT into users
				queries.push(t.none(sql.add, user));

				// INSERTs into user_group if needed
				ga.forEach(function (groupUuid) {
					queries.push(t.none(sql.addGroup,
						[ accountUuid, user.userUuid, groupUuid ]));
				});

				return t.batch(queries);
			}).then(function () {
				return user;
			});
		},

		addGroup: function (accountUuid, userUuid, groupUuid) {
			return rep.none(sql.addGroup, [ accountUuid, userUuid, groupUuid ]);
		},

		removeGroup: function (accountUuid, userUuid, groupUuid) {
			return rep.result(sql.removeGroup,
				[ accountUuid, userUuid, groupUuid ],
				function (r) {
					return r.rowCount;
				});
		},

		groups: function (accountUuid, userUuid) {
			return rep.any(sql.groups, [ accountUuid, userUuid ]);
		},

		remove: function (accountUuid, userUuid) {
			return rep.result(sql.remove, [ accountUuid, userUuid ],
				function (r) {
					return r.rowCount;
				});
			},

		// XXX should find / all also return list of groups??
		find: function (accountUuid, userUuid) {
			return rep.oneOrNone(sql.find, [ accountUuid, userUuid]);
		},

		all: function (accountUuid) {
			return rep.any(sql.all, accountUuid);
		},

		// list all the rules defined explicity for a given user
		rules: function (accountUuid, userUuid) {
			return rep.any(sql.rules, [ accountUuid, userUuid ]);
		},

		// user user-defined and any rules defined for any groups
		// the user is a member in
		allRules: function (accountUuid, userUuid) {
			return rep.any(sql.allRules, [ accountUuid, userUuid ]);
		},

		addRule: function (accountUuid, userUuid, rule) {
			var rule = {
				ruleUuid: uuid.v4(),
				rule: rule
			};

			return rep.none(sql.addRule,
				[ accountUuid, userUuid, rule.ruleUuid, rule.rule ])
				.then(function () {
					return rule;
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
