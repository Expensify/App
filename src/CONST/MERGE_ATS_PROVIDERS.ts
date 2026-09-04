// The provider slug keys below are dictated by Merge's API.
type MergeATSProviderEntry = {
    /** Human-readable label used in the UI */
    displayName: string;

    /** Provider logo served from the Merge CDN */
    iconUrl: string;
};

// Merge supports many more ATS providers than the one below. Add them here as they are rolled out.
const MERGE_ATS_PROVIDERS = {
    greenhouse: {
        displayName: 'Greenhouse',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Greenhouse_Square_Logo.jpg',
    },
} as const satisfies Record<string, MergeATSProviderEntry>;

type MergeATSProviderSlug = keyof typeof MERGE_ATS_PROVIDERS;

export type {MergeATSProviderSlug};
export default MERGE_ATS_PROVIDERS;
