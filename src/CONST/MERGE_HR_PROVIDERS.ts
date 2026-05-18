import type {ValueOf} from 'type-fest';

type MergeHRProviderEntry = {
    /** Human-readable label used in the UI */
    displayName: string;

    /** Provider logo served from the Expensify CDN */
    iconUrl: string;

    /** Onyx/Policy connection key; must start with 'merge_hr_' */
    connectionName: `merge_hr_${string}`;
};

const MERGE_HR_PROVIDERS = {
    workday: {
        displayName: 'Workday',
        iconUrl: 'https://static.expensify.com/merge-hr/workday.png',
        connectionName: 'merge_hr_workday',
    },
    bamboohr: {
        displayName: 'BambooHR',
        iconUrl: 'https://static.expensify.com/merge-hr/bamboohr.png',
        connectionName: 'merge_hr_bamboohr',
    },
    hibob: {
        displayName: 'HiBob',
        iconUrl: 'https://static.expensify.com/merge-hr/hibob.png',
        connectionName: 'merge_hr_hibob',
    },
} as const satisfies Record<string, MergeHRProviderEntry>;

type MergeHRConnectionName = ValueOf<typeof MERGE_HR_PROVIDERS>['connectionName'];

export type {MergeHRConnectionName};
export default MERGE_HR_PROVIDERS;
