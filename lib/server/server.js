// vim:ts=4:sw=4:

module.exports = {
	Server: Server,
	createServer: createServer
};

var assert = require('assert-plus');
var restify = require('restify');
var sdb = require('../db');
var aperture = require('aperture');

function Server(opts) {
	assert.number(opts.port, 'port');
	assert.object(opts.log, 'log');

	var server = restify.createServer({
		name: 'sauth',
		version: '0.42.0',
		log: opts.log
	});

	this.server = server;

	var parser = aperture.createParser({
		types: aperture.types,
		typeTable: {
			clientip: 'ip'
		}
	});

	var evaluator = aperture.createEvaluator({
		types: aperture.types,
		typeTable: {
			clientip: 'ip'
		}
	});

	server.use(restify.requestLogger());
	server.use(restify.queryParser());
	server.use(restify.bodyParser());
	server.use(restify.jsonp());
	server.use(function initHandler(req, res, next) {
		// XXX should probably create new sdb instance for each server
		req.sauth = {
			db: sdb,
			parser: parser,
			evaluator: evaluator
		};
		next();
	});

	// all requests should include an accountUuid header
	server.use(function checkAccount(req, res, next) {
		if (req.header('accountuuid')) {
			next();
		} else {
			next(new restify.BadRequestError('No account specified'));
		}
	});

	server.on('uncaughtException', function (req, res, route, err) {
		opts.log.error(err.stack);
		res.send(err);
	});

	server.pre(function (req, res, next) {
		req.log.info({ req: req}, 'start');
		next();
	});

	server.on('after', function (req, res, route) {
		req.log.info({ req: req }, 'finished');
	});

/*
	XXX -- to do later

	server.get('/', function (req, res) {
		var accept = req.header("Accept");
		if (accept && (accept.search("application/xhtml+xml") != -1
			|| accept.search("text/html") != -1)) {
			res.sendfile(__dirname + "/docs/api.html");
		} else {
			res.header("Content-Type", "application/json");
			res.sendfile(__dirname + "/docs/api.json");
		}
	});
*/

	// Accounts
	server.get({
		name: 'getAllAccounts',
		path: '/accounts'
	}, requireRoot, getAllAccounts);

	server.get({
		name: 'getAccount',
		path: '/accounts/:id'
	}, requireRoot, getAccount);

	server.put({
		name: 'addAccount',
		path: '/accounts'
	}, requireRoot, addAccount);

	server.del({
		name: 'deleteAccount',
		path: '/accounts/:id'
	}, requireRoot, deleteAccount);

	// Users
	server.get({
		name: 'getAllUsers',
		path: '/users'
	}, getAllUsers);

	server.get({
		name: 'getUser',
		path: '/users/:id'
	}, getUser);

	server.put({
		name: 'addUser',
		path: '/users'
	}, addUser);

	server.del({
		name: 'deleteUser',
		path: '/users/:id'
	}, deleteUser);

	server.get({
		name: 'getUserGroups',
		path: '/users/:id/groups'
	}, getUserGroups);

	server.put({
		name: 'addUserToGroup',
		path: '/users/:id/groups/:gid'
	}, addUserToGroup);

	server.del({
		name: 'removeUserFromGroup',
		path: '/users/:id/groups/:gid'
	}, removeUserFromGroup);

	server.get({
		name: 'getUserRules',
		path: '/users/:id/rules'
	}, getUserRules);

	server.get({
		name: 'getAllUserRules',
		path: '/users/:id/rules/all'
	}, getAllUserRules);

	server.put({
		name: 'addUserRule',
		path: '/users/:id/rules'
	}, addUserRule);

	server.del({
		name: 'removeUserRule',
		path: '/users/:id/rules/:rid'
	}, removeUserRule);

	// groups

	server.get({
		name: 'getAllGroups',
		path: '/groups'
	}, getAllGroups);

	server.get({
		name: 'getGroup',
		path: '/groups/:id'
	}, getGroup);

	server.put({
		name: 'addGroupMember',
		path: '/groups/:id/users/:uid'
	}, addGroupMember);

	server.del({
		name: 'removeGroupMember',
		path: '/groups/:id/users/:uid'
	}, removeGroupMember);

	server.get({
		name: 'getGroupRules',
		path: '/groups/:id/rules'
	}, getGroupRules);

	server.put({
		name: 'addGroupRule',
		path: '/groups/:id/rules'
	}, addGroupRule);

	server.del({
		name: 'removeGroupRule',
		path: '/groups/:id/rules/:rid'
	}, removeGroupRule);


	server.get({
		name: 'authorize',
		path: '/authorize'
	}, authorize);

	server.listen(opts.port, function () {
		server.log.info({ port: opts.port }, 'server listening'); });

	return server;
}

Server.prototype.close = function close() {
	this.server.close();
};

function createServer(opts) {
	return new Server(opts);
}

function getAllAccounts(req, res, next) {
	req.sauth.db.accounts.all()
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function getAccount(req, res, next) {
	req.sauth.db.accounts.find(req.params.id)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function addAccount(req, res, next) {
	req.sauth.db.accounts.add(req.params.name)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function deleteAccount(req, res, next) {
	req.sauth.db.accounts.remove(req.params.id)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function getAllUsers(req, res, next) {
	req.sauth.db.users.all(req.header('accountuuid'))
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function getUser(req, res, next) {
	req.sauth.db.users.find(req.header('accountuuid'), req.params.id)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function getUserGroups(req, res, next) {
	req.sauth.db.users.groups(req.header('accountuuid'), req.params.id)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function addUserToGroup(req, res, next) {
	req.sauth.db.users.addGroup(req.header('accountuuid'), req.params.id,
		req.params.gid)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function addUser(req, res, next) {
	if (!req.params.login) {
		next(new restify.BadRequestError('No login specified'));
	}

	req.sauth.db.users.add(req.header('accountuuid'),
		req.params.name || '',
		req.params.login,
		req.params.groups || [])
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function deleteUser(req, res, next) {
	req.sauth.db.users.remove(req.header('accountuuid'), req.params.id)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function removeUserFromGroup(req, res, next) {
	req.sauth.db.users.removeGroup(req.header('accountuuid'), req.params.id,
		req.params.guid)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function getUserRules(req, res, next) {
	req.sauth.db.users.rules(req.header('accountuuid'), req.params.id)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function getAllUserRules(req, res, next) {
	req.sauth.db.users.allRules(req.header('accountuuid'), req.params.id)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function addUserRule(req, res, next) {
	if (!req.params.rule) {
		next(new restify.BadRequestError('Missing rule definition'));
	}

	var info = {
		accountuuid: req.header('accountuuid'),
		useruuid: req.params.id,
		rule: req.params.rule
	};

	req.log.debug('addUserRule ', info);

	// I've not yet found a good way to distinguish between
	// accountUuid doesn't exst and useruuid doesn't exist
	// and be able to usefully return that to the user
	// for this demo, they get a nice and mostly useless 'failed'
	req.sauth.db.users.addRule(info.accountuuid, info.useruuid, info.rule)
		.then(success(req, res, next))
		.catch(failure(req, res, next));
}

function removeUserRule(req, res, next) {
	req.sauth.db.users.removeRule(req.header('accountuuid'), req.params.id,
		req.params.rid)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function getAllGroups(req, res, next) {
	req.sauth.db.groups.all(req.header('accountuuid'))
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function getGroup(req, res, next) {
	req.sauth.db.groups.find(req.header('accountuuid'), req.params.id)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function addGroupMember(req, res, next) {
	req.sauth.db.groups.addUser(req.header('accountuuid'), req.params.id,
		req.params.uid)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function removeGroupMember(req, res, next) {
	req.sauth.db.groups.removeUser(req.header('accountuuid'), req.params.id,
		req.params.uid)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function getGroupRules(req, res, next) {
	req.sauth.db.groups.rules(req.header('accountuuid'), req.params.id)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function addGroupRule(req, res, next) {
	if (!req.params.rule) {
		next(new restify.BadRequestError('missing rule definition'));
	}

	req.sauth.db.groups.addRule(req.header('accountuuid'), req.params.id,
		req.params.rule)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

function removeGroupRule(req, res, next) {
	req.sauth.db.groups.removeRule(req.header('accountuuid'),
		req.params.id,
		req.params.rid)
		.then(success(req, res, next))
		.catch(failure(req, res, next);
}

// To break the chicken and egg problem of creating objects
// requests passed in with a special account uuid of 'root'
// are what are allowed to create accounts
function requireRoot(req, res, next) {
	if (req.header('accountuuid') === 'root') {
		req.log.debug('root access granted');
		next();
		return;
	}

	req.log.debug('request denied (account != root)');
	next(new restify.ForbiddenError('Access denied'));
}

// used to validate access for manipulating users, groups, and rules
function check(action, target, req) {
	var accountUuid = req.header('accountuuid');
	var userUuid = req.header('useruuid');

	var context = {
		action: action,
		resource: target,
		conditions: {
			sourceip: req.connection.remoteAddress
		}
	};

	req.log.debug('Evaluate %s on %s', action, target);

	return req.sauth.db.users.allRules(accountUuid, userUuid)
		.then(function (data) {
			req.log.debug({ rules: data });

			// evaluate each rule individually so that
			// the first match can be logged
			var allow = data.some(function (r) {
				var policy = req.sauth.parser.parse(r.rule);

				if (req.sauth.evaluator.evaluate(policy, context)) {
					req.log.debug('policy %s match; access allowed',
						r.rule_uuid);
					return true;
				} else {
					return false;
				}
			});

			if (!allow) {
				req.log.debug('no matching policies; denying access');
			}

			return allow;
		});
}

function authorize(req, res, next) {
	if (!req.params.action || !req.params.target) {
		next(new restify.BadRequestError('must specify action and target'));
		return;
	}

	check(req.params.action, req.params.target, req)
		.then(function (allow) {
			if (allow) {
				res.json(200, { result: "success" });
			} else {
				res.json(200, { result: "denied" });
			}

			next();
		})
		.catch(function (err) {
			req.log.debug(err);
			next(err);
		});
}

function success(req, res, next) {
	return function (data) {
		req.log.debug('results: ', data);
		res.json(200, data);
		return next();
	};
}

function failure(req, res, next) {
	return function (err) {
		req.log.debug(err);
		next(new restify.BadRequestError('request failed'));
	};
}
