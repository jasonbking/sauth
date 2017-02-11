// Wrapper around database objects and methods
var promise = require('bluebird');

var dbobj = {
	accounts: require('./repos/accounts'),
	users: require('./repos/users'),
	groups: require('./repos/groups')
};

var options = {
	promiseLib: promise,

	// don't use require() so this isn't re-run for every task or tx
	extend: function (obj) {
		obj.accounts = dbobj.accounts(obj, pgp);
		obj.users = dbobj.users(obj, pgp);
		obj.groups = dbobj.groups(obj, pgp);
	}
};

var config = {
	host: 'localhost',
	database: 'sauth',
	user: 'postgres',
	password: 'password'
};

var pgp = require('pg-promise')(options);

var db = pgp(config);

module.exports = db;
