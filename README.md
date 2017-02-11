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

Then:

    make all


## Test

Nothing at this time.

## Documentation

[SAUTH API Guide (maybe)](docs/index.md).

To update the documentation, edit "docs/index.md" and run `make docs`
to update "docs/index.html". Works on either SmartOS or Mac OS X.


## Getting started

Simply run bin/sauth.js

## License
