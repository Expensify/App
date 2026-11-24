/**
 * A jsdom test environment that runs a test file in the time zone named by its docblock, for example
 * `@jest-environment-options {"timezone": "America/Los_Angeles"}`. Jest gives each test a copy of process.env, so
 * setting process.env.TZ inside a test does not change how Date reads local time.
 */
import type {EnvironmentContext, JestEnvironmentConfig} from '@jest/environment';

import {TestEnvironment} from 'jest-environment-jsdom';

class TimezoneEnvironment extends TestEnvironment {
    private readonly timezone: unknown;

    private originalTimezone: string | undefined;

    constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
        super(config, context);
        this.timezone = config.projectConfig.testEnvironmentOptions.timezone;
    }

    async setup() {
        if (typeof this.timezone !== 'string') {
            throw new Error('TimezoneEnvironment needs a "timezone" in @jest-environment-options');
        }
        this.originalTimezone = process.env.TZ;
        process.env.TZ = this.timezone;
        await super.setup();
    }

    async teardown() {
        // Jest reuses worker processes for other test files, which expect the time zone the test command set
        process.env.TZ = this.originalTimezone;
        await super.teardown();
    }
}

export default TimezoneEnvironment;
