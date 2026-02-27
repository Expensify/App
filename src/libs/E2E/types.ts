import type {TEST_NAMES} from 'tests/e2e/config';
import type {ValueOf} from 'type-fest';
import type E2EConfig from '../../../tests/e2e/config';

type SigninParams = {
    email?: string;
};

type IsE2ETestSession = () => boolean;

type NetworkCacheEntry = {
    url: string;
    options: RequestInit;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
};

type NetworkCacheMap = Record<
    string, // hash
    NetworkCacheEntry
>;

type TestConfig = {
    name: ValueOf<typeof TEST_NAMES>;
    [key: string]: string | {autoFocus: boolean};
};

type Test = (config: TestConfig) => void;

type TestModule = {default: Test};

type Tests = Record<ValueOf<typeof E2EConfig.TEST_NAMES>, Test>;

type Unit = 'ms' | 'MB' | '%' | 'renders' | 'FPS';

type TestResult = {
    /** Name of the test */
    name: string;

    /** The branch where test were running */
    branch?: string;

    /** The numeric value of the measurement */
    metric?: number;

    /** Optional, if set indicates that the test run failed and has no valid results. */
    error?: string;

    /**
     * Whether error is critical. If `true`, then server will be stopped and `e2e` tests will fail. Otherwise will simply log a warning.
     * Default value is `true`
     */
    isCritical?: boolean;

    /** The unit of the measurement */
    unit?: Unit;
};

export type {SigninParams, IsE2ETestSession, NetworkCacheMap, NetworkCacheEntry, TestConfig, TestResult, TestModule, Tests, Unit};
