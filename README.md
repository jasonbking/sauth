<!--
    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->

<!--
    Copyright (c) 2016, Joyent, Inc.
-->

# sauth: A (very) simple authorization service

This service allows you to create users and groups within accounts and
manage [aperture](https://github.com/joyent/node-aperture) style policies
assigned associated with those users and groups.

## Development

Setup a postgres instance, and run the following to create the database named
sauth:

    psql -f lib/db/sql/createdb.sql

(At some point this would likely be added as a make target).

Note: for now at least, the server must run on the same system as the
database, and the postgres user should have a password of 'password' (this
*is* a demo).  This can be changed by editing lib/db/index.js and adjusting
the config variable as appropriate.  Obviously in a real system, this would
be set in a config file.


Then:

    make all

Then:

    cd bin; ./sauth.js

Optionally, LOG_LEVEL and NPM_ENVIRONMENT can be set to enable additional
output.

## Test

Nothing at this time.

## Documentation

[SAUTH API Guide (maybe)](docs/index.md).

To update the documentation, edit "docs/index.md" and run `make docs`
to update "docs/index.html". Works on either SmartOS or Mac OS X.


## Getting started

Simply run bin/sauth.js

## License
