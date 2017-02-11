#!/usr/bin/env node
// vim:ts=4:sw=4:et:

var bunyan = require('bunyan');
var dashdash = require('dashdash');
var Server = require('../lib/server/server.js').Server;

function main() {
    var options = [
        {
            names: ['help', 'h'],
            type: 'bool',
            help: 'Print this help and exit.'
        },
        {
            names: ['port', 'p'],
            type: 'number',
            env: 'SAUTH_PORT',
            helpArg: 'PORT',
            default: 8080,
            help: 'listen port'
        }
    ];

    var parser = dashdash.createParser({ options: options });
    var opts;
    try {
        opts = parser.parse(process.argv);
    } catch (e) {
        console.error('error: %s', e.message);
        process.exit(1);
    }

    var help = parser.help().trimRight();
    if (opts.help) {
        console.log('usage: \n' + help);
        process.exit(0);
    }

    var server = new Server({
        log: bunyan.createLogger({
            name: 'server',
            level: process.env.LOG_LEVEL || 'info',
            serializers: {
                res: bunyan.stdSerializers.res,
                req: bunyan.stdSerializers.req
            }
        }),
        port: opts.port
    });
}

if (require.main === module) {
    main();
}
