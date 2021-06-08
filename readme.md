# Blog API (Working Title)

## Table of Contents

- [Local Testing](#local-testing)
  - [Integration](#integration-testing)

## Local Testing

### Integration Testing

Our integration tests utilize docker-compose to bootstrap a new postgres database and an instance of the API with test data set in the database. Once those are running successfully you can run integration tests against this locally running instance of the API.

#### Running Integration Tests
  - Clone the repo
  - Run `npm install` to pull down dependencies
  - Run `npm run container:test:integration` to bring up the local db and server in testing mode
  - In another terminal window run `npm run test:integration` to run integration tests against the local server

#### Writing Integration Tests

Integration tests should not mock any dependencies of the API. All tests should be hitting a locally running version of the API. New integration tests should be placed in a file next to the file they are most closely testing, this will normally be a controller/router file.