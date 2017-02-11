// vim:ts=4:et:sw=4:

module.exports = {
    Server: Server,
    createServer: createServer
};

var assert = require('assert-plus');
var restify = require('restify');
var sdb = require('./db');
var aperture = require('aperture');

function Server(opts) {
    assert.number(opts.port);
    assert.log(opts.log);

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

    server.use(restify.requestLoger());
    server.use(restify.queryParser());
    server.use(restify.bodyParser());
    server.use(function initHandler(req, res, next) {
        // XXX need to create new instance for each server
        req.sauth = {
            db: sdb,
            parser: parser,
            evaluator: evaluator
        };
        next();
    }

    // all requests should include an accountUuid
    server.use(validateAccount);

    server.on('uncaughtException', function (req, res, route, err) {
        opts.log(err.stack);
        res.send(err);
    }

    server.pre((req, res, next) => {
            req.log.info({ req: req}, 'start');
            return next();
    });

    server.on('after', (req, res, route) =>
            req.log.info({ req: req }, 'finished'));


    // XXX: handlers


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

function validateAccount(req, res, next) {
    var accountUuid = req.header('accountuuid');

    if (!accountUuid) {
        return next(new restify.BadRequestError('No account specified'));
    }

    if (accountUuid === 'root') {
        return next();
    }

    req.sauth.db.getAccount(accountUuid)
        .then(() => return next())
        .catch(err => return next(err));
}

function requireRoot(req, res, next) {
    if (req.header('accountuuid') === 'root') {
        req.log.debug('root access granted');
        return next();
    }

    req.log.debug('request denied (account != root)');
    return next(new restify.ForbiddenError('Access denied'));
}

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
