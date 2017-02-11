// vim:ts=4:sw=4:
/*
 * Instead of hard-wiring the SQL used to manipulate the various objects
 * in the service, they are loaded from startup from the various files
 * referenced here, and the resulting objects are used for any database
 * operations by the code under ../repo
 */
var QueryFile = require('pg-promise').QueryFile;
var path = require('path');

module.exports = {
	accounts: {
		add: sql('accounts/add.sql'),
		remove: sql('accounts/remove.sql'),
		find: sql('accounts/find.sql'),
		all: sql('accounts/all.sql')
	},

	users: {
		add: sql('users/add.sql'),
		addGroup: sql('users/addGroup.sql'),
		removeGroup: sql('users/removeGroup.sql'),
		remove: sql('users/remove.sql'),
		find: sql('users/find.sql'),
		all: sql('users/all.sql'),
		rules: sql('users/rules.sql'),
		allRules: sql('users/allRules.sql'),
		addRule: sql('users/addRule.sql'),
		removeRule: sql('users/removeRule.sql')
	},

	groups: {
		add: sql('groups/add.sql'),
		addUser: sql('groups/addUser.sql'),
		removeUser: sql('groups/removeUser.sql'),
		remove: sql('groups/remove.sql'),
		find: sql('groups/find.sql'),
		all: sql('groups/all.sql'),
		rules: sql('groups/rules.sql'),
		addRule: sql('groups/addRule.sql'),
		removeRule: sql('groups/removeRule.sql')
	}
};

function sql(file) {
	var pathname = path.join(__dirname, file);

	var options = {
		minify: true,
		params: {
			schema: 'public'
		}
	};

	var qf = new QueryFile(pathname, options);

	// XXX: how to pass a parameter for module init?
	// then could pass bunyan log instance
	if (qf.error) {
		console.error(qf.error);
	}

	return qf;
}
