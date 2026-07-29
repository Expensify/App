type MergeHRProviderEntry = {
    /** Human-readable label used in the UI */
    displayName: string;

    /** Provider logo served from the Merge CDN */
    iconUrl: string;
};

const MERGE_HR_PROVIDERS = {
    workday: {
        displayName: 'Workday',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/PlatformWorkday.png',
    },
    bamboohr: {
        displayName: 'BambooHR',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/BambooHR_Square_Logo.jpg',
    },
    hibob: {
        displayName: 'HiBob',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/PlatformHibob.png',
    },
} as const satisfies Record<string, MergeHRProviderEntry>;

type MergeHRProviderSlug = keyof typeof MERGE_HR_PROVIDERS;

export type {MergeHRProviderSlug};
export default MERGE_HR_PROVIDERS;
