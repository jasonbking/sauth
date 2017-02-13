---
title: SAUTH REST API
---

# Simple Authorization REST API

This is just a simple demo / proof of concept.  It allows for the creation
of accounts.  Each account can hold users and groups.  
[Aperture](https://github.com/joyent/node-aperture) style policies/rules can be
associated with users and groups.  Clients can then have the service determine
if a user is authorized to perform an action based on the rules.

# Accounts

Accounts are what hold users and groups.  Each account has a unique name as
well as a UUID.  All requests *must* include an `accountuuid` header in their
request, indicating the account on which to operate.  All operations on users
and groups are restricted to those in the account given in the accountuuid
header.

To solve the chicken and egg problem of populating the system, a special
account UUID 'root' is used for all operations on any `/accounts` endpoints.
Obviously in a real system, things wouldn't work like this, but hey, it's
just a demo.

## GET /accounts

Return all accounts that exist in the system.

## GET /account/:id

Return the account with UUID id, or an empty json list.
XXX: Better response if UUID is not found?

## PUT /account

Create an account.

## DELETE /account/:id

Delete the account with the UUID :id and all users, groups, and rules defined
in the account.

# Users

All users have a UUID (useruuid), a login (not used in the demo), and an
optional freeform name (also not used).

## GET /users

Return all users in the account

## GET /users/:id

Return the info of a user with the given UUID

## GET /users/:id/groups

Return the groups the given user is in

## PUT /users/:id/groups/:gid

Add the user to the group with the :gid UUID

## DELETE /users/:id/groups/:gid

Remove a user from the group with the :gid UUID

## GET /users/:id/rules

Get the rules set on the given user

## PUT /users/:id/rules

Add a rule to the given user.  Returns the created rule including it's UUID.

## DELETE /users/:id/rules/:rid

Remove the given rule from a user.

## GET /users/:id/rules/all

Get the effective set of rules -- those set for the user, plus all the rules
set on any groups the user is a member of.

# Groups

Groups just have a name

## GET /groups

Get all the groups for the account.

## GET /groups/:id

Get just one group with the UUID :id.

## PUT /groups/:id/users/:uid

Add a user with the UUID :uid to the given group.  This is equivalent to
a PUT /users/:uid/groups/:gid.

## DELETE /groups/:id/users/:uid

Remove a user from the given group

## GET /groups/:id/rules

Get all the rules defined for this group.

## PUT /groups/:id/rules

Add a rule to this group

## DELETE /groups/:id/rules/:rid

Remove the given rule from a group.

# Authorization

## GET /authorization

    AccountUuid: ....
    UserUuid: ....

    {
        "action": "read",
	"target": "something
    }
