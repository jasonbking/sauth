#!/usr/bin/env node
// vim:ts=4:sw=4:et:

var assert = require('assert-plus');
var restify = require('restify');
var bunyan = require('bunyan');

// it's better than bad, it's good
var log = bunyan.createLogger({
    name: 'sauth-client',
    level: process.env.LOG_LEVEL || 'info',
    serializers: {
        res: bunyan.stdSerializers.res,
        req: bunyan.stdSerializers.req
    }
});

var client = restify.createJsonClient({
    url: process.env.SAUTH_URL || 'http://localhost:8080',
    version: '*',
    log: log,
    headers: {
        AccountUuid: process.env.SAUTH_ACCT
    }
});

if (!(process.env.SAUTH_ACCT === 'root') && !process.env.SAUTH_USER) {
    console.error('SAUTH_USER is not set; please set to user UUID of '
        + 'request');
    process.exit(1);
}

if (process.argv.length < 2 || process.argv[2] === 'help') {
    console.error('Usage:');
    console.error('SAUTH_ACCT should be set to the account UUID');
    console.error('SAUTH_USER should be set to the user performing any '
        + 'user/group/authorize actions');
    console.error('sauth-client.js account [ list | add <name> | del <uuid> ]');
    console.error('sauth-client.js user [ add <login> <name> | list | '
        + 'del <uuid> | addrule <rule> | delrule <rule uuid> | '
        + 'addgroup <group uuid> | delgroup <group uuid> ]');
    console.error('sauth-client.js group [ add <name> | list | del <uuid> | '
        + 'adduser <uuid> | deluser <uuid> | addrule <rule> | delrule <uuid>');
    console.error('sauth-client.js authorize action target');
    process.exit(1);
}

switch (process.argv[2]) {
    case 'account':
        do_account(process.argv.slice(3));
        break;
    case 'user':
        do_user(process.argv.slice(3));
        break;
    case 'group':
        do_group(process.argv.slice(3));
        break;
    case 'authorize':
        authorize(process.argv[3], process.argv[4]);
        break;
    default:
        console.log('Unknown target ' + process.argv[2]);
}


function do_account(argv) {
    switch (argv[0]) {
    case 'list':
        client.get('/accounts', function (err, req, res, obj) {
            if (err && err.statusCode != 200) {
                console.log(obj.message);
                process.exit(1);
            }

            // XXX: I'm sure there's a better way somewhere
            console.log('%s                                 %s',
                "UUID", "Name");
            obj.forEach(function (a) {
                console.log('%s %s', a.acctuuid, a.name);
            });
        });
        break;

    case 'add':
        var obj = {
            name: argv[1]
        };

        client.put('/accounts', obj, function (err, req, res, obj) {
            if (err && err.statusCode != 200) {
                console.log(obj.message);
                process.exit(1);
            }

            console.log(obj);
        });

        break;

    case 'delete':
        client.del('/accounts/' + argv[1], function (err, req, res, obj) {
            if (err && err.statusCode != 200) {
                console.log(obj.message);
                process.exit(1);
            }
        });
        break;

    default:
        console.error('Unknown option ' + argv[0]);
        process.exit(1);
    }
}

function do_user(argv) {
    var options = {
        path: '/users',
        headers: {
            useruuid: process.env.SAUTH_USER
        }
    };

    switch (argv[0]) {
    case 'add':
        var obj = {
            login: argv[1],
            name: argv[2]
        };
        client.put(options, obj, function (err, req, res, obj) {
            if (err && err.statusCode != 200) {
                console.log(obj.message);
                process.exit(1);
            }

            console.log(obj);
        });
        break;

    case 'list':
        client.get(options, function (err, req, res, obj) {
            if (err && err.statusCode != 200) {
                console.log(obj.message);
                process.exit(1);
            }

            console.log('%s                                 %s',
                "UUID", "Name");
            obj.forEach(function (u) {
                console.log('%s %s', u.useruuid, u.name);
            });
        });            
        break;

    case 'listgroup':
        options.path += '/' + argv[1] + '/groups';
        client.get(options, function (err, req, res, obj) {
            if (err && err.statusCode != 200) {
                console.log(obj.message);
                process.exit(1);
            }

            console.log('%s                                 %s',
                "UUID", "Group");
            obj.forEach(function (g) {
                console.log('%s %s', g.groupuuid, g.name);
            });
        });            

    case 'del':
        options.path += '/' + argv[1];
        client.del(options, function (err, req, res, obj) {
            if (err && err.statusCode != 200) {
                console.log(obj.message);
                process.exit(1);
            }
        });
        break;

    case 'ruleadd':
        options.path += '/' + argv[1] + '/rules';
        var obj = {
            rule: argv[2]
        };

        client.put(options, obj, function (err, req, res, obj) {
            if (err && err.statusCode != 200) {
                console.log(obj.message);
                process.exit(1);
            }
            console.log(obj);
        });
        break;

    case 'ruledel':
        options.path += '/' + argv[1] + '/rules/' + argv[2];
        client.del(options, function (err, req, res, obj) {
            if (err && err.statusCode != 200) {
                console.log(obj.message);
                process.exit(1);
            }
        });
        break;

    default:
        console.error('Unkown option ' + argv[0]);
        process.exit(1);
    }
}

function do_group(argv) {
    var options = {
        path: '/groups',
        headers: {
            useruuid: process.env.SAUTH_USER
        }
    };

    switch (argv[0]) {
    case 'add':
        var obj = {
            name: argv[1]
        };

        client.put(options, obj, function (err, req, res, obj) {
            if (err && err.statusCode != 200) {
                console.log(obj.message);
                process.exit(1);
            }

            console.log(obj);
        });
        break;

    case 'list':
        client.get(options, function (err, req, res, obj) {
            if (err && err.statusCode != 200) {
                console.log(obj.message);
                process.exit(1);
            }

            console.log('%s                                 %s',
                "UUID", "Name");
            obj.forEach(function (g) {
                console.log('%s %s', g.groupuuid, g.name);
            });
        });            
        break;

    case 'del':
        options.path += '/' + argv[1];
        client.del(options, function (err, req, res, obj) {
            if (err && err.statusCode != 200) {
                console.log(obj.message);
                process.exit(1);
            }
        });
        break;

    case 'ruleadd':
        options.path += '/' + argv[1] + '/rules';
        var obj = {
            rule: argv[2]
        };

        client.put(options, obj, function (err, req, res, obj) {
            if (err && err.statusCode != 200) {
                console.log(obj.message);
                process.exit(1);
            }
            console.log(obj);
        });
        break;

    case 'ruledel':
        options.path += '/' + argv[1] + '/rules/' + argv[2];
        client.del(options, function (err, req, res, obj) {
            if (err && err.statusCode != 200) {
                console.log(obj.message);
                process.exit(1);
            }
        });
        break;

    default:
        console.error('Unkown option ' + argv[0]);
        process.exit(1);
    }
}

function authorize(action, target) {
    // XXX: this should be properly escaped
    var path = '/authorize?action=' + action + '&' + 'target=' + target;

    var options = {
        path: path,
        headers: {
            useruuid: process.env.SAUTH_USER
        }
    };

    var input = {
        action: action,
        target: target
    };

    client.get(options, function (err, req, res, obj) {
        assert.ifError(err);
        if (obj.result === 'success') {
            console.log('request allowed');
            process.exit(0);
        } else {
            console.log('request denied');
            process.exit(1);
        }
    });
}
