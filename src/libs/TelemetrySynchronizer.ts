/**
 * This file contains the logic for sending additional data to Sentry.
 *
 * It uses Onyx.connectWithoutView as nothing here is related to the UI. We only send data to external provider and want to keep this outside of the render loop.
 */

// We moved Fullstory connection to Expensify.tsx but we want to keep the file as it will be needed in https://github.com/Expensify/App/pull/73848 which will be merged asap
