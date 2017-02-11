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
request, indicating the account on which to operate.

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

## GET /users

## GET /users/:id

## GET /users/:id/groups

## PUT /users/:id/groups/:gid

## DELETE /users/:id/groups/:gid

## GET /users/:id/rules

## PUT /users/:id/rules

## DELETE /users/:id/rules/:rid

## GET /users/:id/rules/all

# Groups

## GET /groups

## GET /groups/:id

## PUT /groups/:id/users/:uid

## DELETE /groups/:id/users/:uid

## GET /groups/:id/rules

## PUT /groups/:id/rules

## DELETE /groups/:id/rules/:rid

# Authorization

## GET /authorization
