# Express Starter (Batteries Included)

[![CI](https://github.com/JosiahSayers/express-template/actions/workflows/ci.yml/badge.svg)](https://github.com/JosiahSayers/express-template/actions/workflows/ci.yml)

## Table of Contents

- [Features](#features)
- [Local Testing](#local-testing)
  - [Integration](#integration-testing)
  - [Unit](#unit-testing)

## Features

- Postgres Database
- Express Server
- User Accounts
- Request Validation (Joi)
- Unit Testing (Jest)
- Integration Testing (Jest)
- Local dev environment (Docker)

## Local Testing

### Integration Testing

Our integration tests utilize docker-compose to bootstrap a new postgres database and an instance of the API with test data set in the database. Once those are running successfully you can run integration tests against this locally running instance of the API.

#### Running Integration Tests
  - Clone repo and install dependencies
  - Run `npm run container:test:integration` to bring up the local db and server in testing mode
  - In another terminal window run `npm run test:integration` to run integration tests against the local server

#### Writing Integration Tests

Integration tests should not mock any dependencies of the API. All tests should be hitting a locally running version of the API. New integration tests should be placed in a file next to the file they are most closely testing, this will normally be a controller/router file. They should be named in this convention: `<filename-of-code-being-tested>.integration.test.ts`

### Unit Testing

#### Running Unit Tests
  - Clone repo and install dependencies
  - Run `npm run test:unit` to run all unit tests

#### Writing Unit Tests

Unit tests try and test a single piece of code. External dependencies should be mocked in unit tests. New unit tests should be placed in a file next to the file they are testing. They should be named in this convention: `<filename-of-code-being-tested>.unit.test.ts`
