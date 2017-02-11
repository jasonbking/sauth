// vim:ts=4:et:sw=4:

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
            clientip: 'ip',
        }
    });

    var evaluator = aperture.createEvaluator({
        types: aperture.types,
        typeTable: {
            clientip: 'ip',
        }
    });

    server.use(restify.requestLogger());
    server.use(restify.queryParser());
    server.use(restify.bodyParser());
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

    server.pre((req, res, next) => {
        req.log.info({ req: req}, 'start');
        next();
    });

    server.on('after', (req, res, route) =>
        req.log.info({ req: req }, 'finished'));


    // Accounts
    server.get({
        name: 'getAllAccounts',
        path: '/accounts'
    }, requireRoot, db(sdb.accounts.all));

    server.get({
        name: 'getAccount',
        path: '/accounts/:id'
    }, requireRoot, db(req => sdb.accounts.find(req.params.id)));

    server.put({
        name: 'addAccount',
        path: '/accounts'
    }, requireRoot, db(req => sdb.accounts.add(req.params.name)));

    server.del({
        name: 'deleteAccount',
        path: '/accounts/:id',
    }, requireRoot, db(req => sdb.accounts.remove(req.params.id)));

    // Users
    server.get({
        name: 'getAllUsers',
        path: '/users',
    }, db(req => sdb.users.all(req.header('accountuuid'))));

    server.get({
        name: 'getUser',
        path: '/users/:id',
    }, db(req => sdb.users.find(req.header('accountuuid'), req.params.id)));

    server.put({
        name: 'addUser',
        path: '/users'
    }, db(req =>
        sdb.users.add(req.header('accountuuid'), req.params.name,
            req.params.login, req.params.groups || [])));

    server.del({
        name: 'deleteUser',
        path: '/users/:id'
    }, db(req => sdb.users.remove(req.header('accountuuid'), req.params.id)));

    server.get({
        name: 'getUserGroups',
        path: '/users/:id/groups'
    }, db(req => sdb.users.groups(req.header('accountuuid'), req.params.id)));

    server.put({
        name: 'addUserToGroup',
        path: '/users/:id/groups/:gid',
    }, db(req =>
        sdb.users.addGroup(req.header('accountuuid'), req.params.id,
            req.params.gid)));

    server.del({
        name: 'removeUserFromGroup',
        path: '/users/:id/groups/:gid'
    }, db(req =>
            sdb.users.removeGroup(req.header('accountuuid'),
                req.params.id, req.params.gid)));

    server.get({
        name: 'getUserRules',
        path: '/users/:id/rules'
    }, db(req => sdb.users.rules(req.header('accountuuid'), req.params.id)));

    server.get({
        name: 'getAllUserRules',
        path: '/users/:id/rules/all'
    }, db(req => sdb.users.allRules(req.header('accountuuid'), req.params.id)));

    server.put({
        name: 'addUserRule',
        path: '/users/:id/rules'
    }, db(req =>
        sdb.users.addRule(req.header('accountuuid'), req.params.id,
            req.params.rule)));

    server.del({
        name: 'removeUserRule',
        path: '/users/:id/rules/:rid'
    }, db(req =>
        sdb.users.removeRule(req.header('accountuuid'), req.params.id,
            req.params.rid)));

    // groups

    server.get({
        name: 'getAllGroups',
        path: '/groups'
    }, db(req => sdb.groups.all(req.header('accountuuid'))));

    server.get({
        name: 'getGroup',
        path: '/groups/:id'
    }, db(req => sdb.groups.find(req.header('accountuuid'), req.params.id)));

    server.put({
        name: 'addGroupMember',
        path: '/groups/:id/users/:uid'
    }, db(req =>
        sdb.groups.addUser(req.header('accountuuid'), req.params.id,
            req.params.uid)));

    server.del({
        name: 'removeGroupMember',
        path: '/groups/:id/users/:uid'
    }, db(req =>
        sdb.groups.removeUser(req.header('accountuuid'), req.params.id,
            req.params.uid)));

    server.get({
        name: 'getGroupRules',
        path: '/groups/:id/rules'
    }, db(req => sdb.groups.rules(req.header('accountuuid'), req.params.id)));

    server.put( {
        name: 'addGroupRule',
        path: '/groups/:id/rules'
    }, db(req =>
        sdb.groups.addRule(req.header('accountid'), req.params.id,
            req.params.rule)));

    server.del({
        name: 'removeGroupRule',
        path: '/groups/:id/rules/:rid'
    }, db(req =>
        sdb.groups.removeRule(req.header('accountid'), req.params.id,
            req.params.rid)));


    server.get({
        name: 'authorize',
        path: '/authorize'
    }, authorize);
 
    server.listen(opts.port, () =>
        server.log.info({ port: opts.port }, 'server listening'));

    return server;
}

Server.prototype.close = function close() {
    this.server.close();
}

function createServer(opts) {
    return new Server(opts);
}

function db(dbc) {
    return function (req, res, next) {
        dbc(req).then(data => {
            req.log.debug('results: ', data);
            res.json(200, data);
            return next();
        })
        .catch(err => {
            req.log.debug(err);
            return next(err);
        });
    }
}

// To break the chicken and egg problem of creating objects
// requests passed in with a special account uuid of 'root'
// are what are allowed to create accounts
function requireRoot(req, res, next) {
    if (req.header('accountuuid') === 'root') {
        req.log.debug('root access granted');
        next();
    }

    req.log.debug('request denied (account != root)');
    next(new restify.ForbiddenError('Access denied'));
}

// used to validate access for manipulating users, groups, and rules
function check(action, target) {
    return function (req, res, next) {
        var accountUuid = req.header('accountuuid');

        if (accountUuid === 'root') {
            return next();
        }

        var userUuid = req.header('useruuid');
        var context = {
            action: action,
            resource: target,
            conditions: {
                sourceip: req.connection.remoteAddress
            }
        };

        res.log.debug('Evaluate %s on %s', action, target);

        req.sauth.db.user.allRules(accountUuid, userUuid)
            .then(data => {
                res.log.debug({ rules: data });

                // evaluate each rule individually so that
                // the first match can be logged
                data.forEach( r => {
                    var policy = req.sauth.parser.parse(r.rule);

                    if (req.sauth.evaluator.evaluate(policy, context)) {
                        res.log.debug('policy %s match; acces allowed',
                            r.rule_uuid);
                        return next();
                    }
                });

                req.log.debug('no matching policies; denying access');
                return next(new restify.ForbiddenError('Access denied'));
            })
            .catch(err => {
                res.log.debug(err);
                return next(err);
            });
    };
}

function authorize(req, res, next) {
    var context = {
        action: req.params.action,
        resource: req.params.target,
        conditions: {
            sourceip: req.connection.remoteAddress
        }
    };

    req.log.debug('Evaluate ' + context.action + ' on ' + context.target);
    req.sauth.db.allRules(req.header('accountuuid'), req.header('useruuid'))
        .then(rules => {
            if (!rules) {
                return next(new restify.ForbiddenError('Access denied'));
            }

            req.log.debug('Rules: ', rules);

            rules.forEach(r => {
                var policy = req.sauth.parser.parse(r.rule);

                if (req.sauth.evaluator.evaluate(policy, context)) {
                    req.log.debug('policy ' + r.ruleUuid + ' match; '
                        + 'access granted');
                    res.json(200, r);
                    return next();
                }
            });

            req.log.debug('no matching policies; denying access');
            return next(new restify.ForbiddenError('Access denied'));
        })
        .catch(err => {
            req.log.debug(err);
            return (next(err));
        });
}

