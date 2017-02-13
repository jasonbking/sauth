-- This will create an empty database
-- Not really sure the best place for it, so for now
-- it lives with the rest of the SQL

-- For our purposes, we use the default schema (public)

-- Field size limitations are largely arbitrary in that there probably
-- should be a reasonable upper limit, i.e. a 4 character limit is
-- (outside of the mainframe world at least) probably far too small
-- but a 1024 character login or account name is probably too large

-- The constraints here try to represent a balance between doing everything
-- in the database and doing nothing in the database.  They should effectively
-- give you subtypes for certain columns and reflect the most critical
-- assumptions that the system expects.  As a generic example, an 'age'
-- column would likely be stored as an INTEGER, however an age should never
-- be negative, so such a column would contain a CHECK (age >= 0)

-- While we could likely link rows using strictly UUIDs, most database systems
-- still use INTEGER ids for most purposes, and is almost likely going to
-- result in less space and faster joins.  If so desired, it would not be
-- a huge effort to create views of these tables that hide the underlying
-- primary keys and present a strictly UUID-based view of the data.

DROP DATABASE IF EXISTS sauth;
CREATE DATABASE sauth;

\c sauth;

-- Accounts hold users and groups
CREATE TABLE accounts (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(32) NOT NULL UNIQUE CHECK (name !~ E'\\s+'),
    acct_uuid   UUID NOT NULL UNIQUE
);

-- A user is a member of exactly one account
-- A users login is unique within a given account, and cannot
-- contain whitespace
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    acct_id	INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    user_uuid   UUID NOT NULL UNIQUE,
    -- the value that would be used to login to a system
    login       VARCHAR(32) NOT NULL CHECK (login !~ E'\\s+'),
    -- A free-form optional description
    name        VARCHAR(256),
    UNIQUE(acct_id, login)
);

-- A group is a member of exactly one account
-- A group name is unique within a given account, and cannot
-- contain whitespace
CREATE TABLE groups (
    id              SERIAL PRIMARY KEY,
    group_uuid      UUID NOT NULL UNIQUE,
    account_id      INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    name            VARCHAR(32) NOT NULL CHECK (name !~ E'\\s+'),
    CONSTRAINT group_unique_in_acct UNIQUE(account_id, name)
);

-- Track membership of users into groups
-- A user can be in 0 or more groups, and groups can have
-- 0 or more members (users)
CREATE TABLE user_groups (
    user_id	INTEGER REFERENCES users(id) ON DELETE CASCADE,
    group_id    INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    UNIQUE (user_id, group_id)
);

-- Rules (or policies) can be attached to an individual user or
-- a group.  With this setup, the rules principals are implied and
-- are the object to which they are attached. 
CREATE TABLE user_rules (
    id		SERIAL PRIMARY KEY,
    rule_uuid   uuid NOT NULL UNIQUE,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rule        TEXT NOT NULL
);

CREATE TABLE group_rules (
    id		SERIAL PRIMARY KEY,
    rule_uuid   uuid NOT NULL UNIQUE,
    group_id    INTEGER REFERENCES groups(id) ON DELETE CASCADE, 
    rule        TEXT NOT NULL
);

