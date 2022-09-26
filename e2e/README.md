# E2E performance regression tests

This directory contains the scripts and configuration files for running the
performance regression tests. These tests are called E2E tests, because they
run the app on a real device (physical or emulated).

To run the e2e tests:

 1. Connect an android device. The tests are currently designed to run only on android. It can be
    a physical device or an emulator.

 2. Make sure fastlane was initialized by running `bundle install` 

 3. Run the tests with `npm run test:e2e`. 

## Structure

For the test suite no additional tooling was used. It is made of the following
components:

- Test server:
  - A nodeJS application that starts a WebSocket server.
  - Responsible for the communication between the test script and the app.
  - Located in `e2e/server`.

- Client:
  - Client-side code (app) needed for communication with the test server.
  - Provides separate entry point for react native application.
  - Located in `src/libs/e2e`.

- The tests themselves and their utilities:
  - The file with the test procedure, using commands from the test server.
  - Utilities for helping with execution of the test, or measuring and comparing results.
  - Located in `e2e/tests` (and accompanying directories).

### A test structure

To run certain actions within the app, the test script sends commands using the test server to the client

### Server Client communication

## Android specifics

The tests are designed to run on android (although adding support for iOS should be easy to add).
To test under realistic conditions during the tests a release build is used.

However, to enable the WebSocket communication to our local WebSocket server, we need to allow
[cleartext http traffic](https://developer.android.com/training/articles/security-config#CleartextTrafficPermitted).
Therefor, a customized release build type is needed, which is called `e2eRelease`. This build type has clear
text traffic enabled, but works otherwise just like a release build.
