import type {ValueOf} from 'type-fest';

const MERGE_HR_PREFIX = 'merge_hr_';

type MergeHRProviderEntry = {
    /** Human-readable label used in the UI */
    displayName: string;

    /** Provider logo served from the Merge CDN */
    iconUrl: string;

    /** Onyx/Policy connection key */
    connectionName: `${typeof MERGE_HR_PREFIX}${string}`;
};

const MERGE_HR_PROVIDERS = {
    workday: {
        displayName: 'Workday',
        iconUrl: '',
        connectionName: `${MERGE_HR_PREFIX}workday`,
    },
    bamboohr: {
        displayName: 'BambooHR',
        iconUrl: '',
        connectionName: `${MERGE_HR_PREFIX}bamboohr`,
    },
    hibob: {
        displayName: 'HiBob',
        iconUrl: '',
        connectionName: `${MERGE_HR_PREFIX}hibob`,
    },
} as const satisfies Record<string, MergeHRProviderEntry>;

type MergeHRConnectionName = ValueOf<typeof MERGE_HR_PROVIDERS>['connectionName'];

export type {MergeHRConnectionName};
export default MERGE_HR_PROVIDERS;
