---
title: Demo
---

# Getting started

Fire up the server (in this case, I'm upping the logging level):

    $ cd bin; LOG_LEVEL=debug ./sauth.js | ../node_modules/.bin/bunyan

Now in another window, let's create some accounts:

    $ cd bin
    $ SAUTH_ACCT=root ./sauth-client.js account add weyland
    { name: 'weyland',
      accountUuid: 'ad1ffc5f-23fa-40c3-acab-c88a9fd8c30d',
      admin:
       { accountUuid: 'ad1ffc5f-23fa-40c3-acab-c88a9fd8c30d',
         userUuid: '6b22540c-6df6-4360-bb08-e470b1005b59',
         login: 'admin',
         name: 'Administrator',
         rule:
          { ruleUuid: '716ef531-3eae-4672-b117-1fa0e7cc3524',
            rule: 'CAN * anything' } } }

    $ SAUTH_ACCT=root ./sauth-client.js account add umbrella
    { name: 'umbrella',
      accountUuid: '49035894-aa01-48d3-a7a3-5bb53d63a3a3',
      admin:
       { accountUuid: '49035894-aa01-48d3-a7a3-5bb53d63a3a3',
         userUuid: 'e0cf6cc0-dfe7-4dc7-9ff3-0d364f327f58',
         login: 'admin',
         name: 'Administrator',
         rule:
          { ruleUuid: '388a203a-4be8-40c7-8e04-a8fc2523d91e',
            rule: 'CAN * anything' } } }

A bit less dystopic,

    $ SAUTH_ACCT=root ./sauth-client.js account add acme
    { name: 'acme',
      accountUuid: '591bb857-5611-4caf-9d6a-fb3a9cebd281',
      admin:
       { accountUuid: '591bb857-5611-4caf-9d6a-fb3a9cebd281',
         userUuid: 'd5f9b496-2d5c-400f-870c-fbbe4dc7dcf6',
         login: 'admin',
         name: 'Administrator',
         rule:
          { ruleUuid: '19669f66-5f82-4e0e-bcf6-e15a5fed3c78',
            rule: 'CAN * anything' } } }
    $ SAUTH_ACCT=root ./sauth-client.js account delete 49035894-aa01-48d3-a7a3-5bb53d63a3a3

Now let's add some users:

    $ export SAUTH_ACCT=591bb857-5611-4caf-9d6a-fb3a9cebd281
    $ export SAUTH_USER=d5f9b496-2d5c-400f-870c-fbbe4dc7dcf6
    $ ./sauth-client.js user add wiley 'Wile E Coyote'
    { accountUuid: '591bb857-5611-4caf-9d6a-fb3a9cebd281',
      userUuid: '7e20fb85-0bc0-4e0c-bf7c-8b21531f2926',
      login: 'wiley',
      name: 'Wile E Coyote',
      groups: [] }
    $ ./sauth-client.js user add roadrunner 'Beep Beep'
    { accountUuid: '591bb857-5611-4caf-9d6a-fb3a9cebd281',
      userUuid: '5863c1e4-3c34-4036-be5b-9b77abf420be',
      login: 'roadrunner',
      name: 'Beep Beep',
      groups: [] }

Note that only the admin account has any permissions at this point:

    $ SAUTH_USER='5863c1e4-3c34-4036-be5b-9b77abf420be' ./sauth-client.js user add train ''
    Access denied

Now let's create a group:

    $ ./sauth-client.js group add anti-gravity
    { accountUuid: '591bb857-5611-4caf-9d6a-fb3a9cebd281',
      groupUuid: 'b7138b2c-1b92-44f0-b3af-3851a7ceeee0',
      name: 'anti-gravity',
      users: [] }

And add the roadrunner to it:

    $ ./sauth-client.js group adduser \
    b7138b2c-1b92-44f0-b3af-3851a7ceeee0 \
    5863c1e4-3c34-4036-be5b-9b77abf420be
    {}

Now add some rules to the group:

    $ ./sauth-client.js group addrule \
    b7138b2c-1b92-44f0-b3af-3851a7ceeee0 \
    'CAN defy gravity'
    { ruleUuid: 'dba2779e-ad9c-4195-a43b-5843a332adf9',
      rule: 'CAN defy gravity' }

Now let's test it:

    $ roadrunner=5863c1e4-3c34-4036-be5b-9b77abf420be
    $ coyote=7e20fb85-0bc0-4e0c-bf7c-8b21531f2926
    $ SAUTH_USER=$roadrunner ./sauth-client.js authorize defy gravity
    request allowed
    $ SAUTH_USER=$coyote ./sauth-client.js authorize defy gravity
    request denied

