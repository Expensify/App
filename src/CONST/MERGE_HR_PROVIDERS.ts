import type {ValueOf} from 'type-fest';

const MERGE_HR_PREFIX = 'merge_hr_' as const;

type MergeHRProviderEntry = {
    displayName: string;
    iconUrl: string;
    connectionName: `${typeof MERGE_HR_PREFIX}${string}`;
};

const MERGE_HR_PROVIDERS = {
    workday: {
        displayName: 'Workday',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/PlatformWorkday.png',
        connectionName: `${MERGE_HR_PREFIX}workday`,
    },
    bamboohr: {
        displayName: 'BambooHR',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/PlatformBambooHR.png',
        connectionName: `${MERGE_HR_PREFIX}bamboohr`,
    },
    hibob: {
        displayName: 'HiBob',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/PlatformHiBob.png',
        connectionName: `${MERGE_HR_PREFIX}hibob`,
    },
} as const satisfies Record<string, MergeHRProviderEntry>;

type MergeHRConnectionName = ValueOf<typeof MERGE_HR_PROVIDERS>['connectionName'];

export default MERGE_HR_PROVIDERS;
export {MERGE_HR_PREFIX};
export type {MergeHRConnectionName, MergeHRProviderEntry};
