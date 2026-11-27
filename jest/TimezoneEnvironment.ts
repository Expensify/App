/**
 * A jsdom test environment that runs a test file in the time zone named by its docblock, for example
 * `@jest-environment-options {"timezone": "America/Los_Angeles"}`. Jest gives each test a copy of process.env, so
 * setting process.env.TZ inside a test does not change how Date reads local time.
 */
import {TestEnvironment} from 'jest-environment-jsdom';

class TimezoneEnvironment extends TestEnvironment {
    private readonly timezone: unknown;

    private originalTimezone: string | undefined;

    constructor(...args: ConstructorParameters<typeof TestEnvironment>) {
        super(...args);
        this.timezone = args[0].projectConfig.testEnvironmentOptions.timezone;
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
        // Jest reuses worker processes for other test files, which expect the time zone the test command set. Assigning
        // undefined would store the string "undefined", which Node reads as UTC, so an unset TZ is deleted instead.
        if (this.originalTimezone === undefined) {
            delete process.env.TZ;
        } else {
            process.env.TZ = this.originalTimezone;
        }
        await super.teardown();
    }
}

export default TimezoneEnvironment;
