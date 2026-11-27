import type {ValueOf} from 'type-fest';

import CONST from '.';

// The provider slug keys below are dictated by Merge's API.
type MergeATSProviderEntry = {
    /** Human-readable label used in the UI */
    displayName: string;

    /** Provider logo served from the Merge CDN */
    iconUrl: string;

    /** The ATS fields the provider exposes that a candidate's default approver can be read from, in display order */
    approverFields: ReadonlyArray<ValueOf<typeof CONST.MERGE.ATS_APPROVER_FIELD>>;
};

// Merge supports many more ATS providers than the ones below. Add them here as they are rolled out.
const MERGE_ATS_PROVIDERS = {
    ashby: {
        displayName: 'Ashby',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Ashby_Square_Logo_3uQWavw.png',
        approverFields: [CONST.MERGE.ATS_APPROVER_FIELD.RECRUITER, CONST.MERGE.ATS_APPROVER_FIELD.HIRING_MANAGER, CONST.MERGE.ATS_APPROVER_FIELD.RECRUITING_COORDINATOR],
    },
    greenhouse: {
        displayName: 'Greenhouse',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Greenhouse_Square_Logo.jpg',
        approverFields: [CONST.MERGE.ATS_APPROVER_FIELD.RECRUITER, CONST.MERGE.ATS_APPROVER_FIELD.RECRUITING_COORDINATOR],
    },
    lever: {
        displayName: 'Lever',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Lever_Square_Logo_oYg8yBW.jpg',
        approverFields: [],
    },
    workable: {
        displayName: 'Workable',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Workable_Square_Logo_OvllNl9.jpg',
        approverFields: [],
    },
} as const satisfies Record<string, MergeATSProviderEntry>;

type MergeATSProviderSlug = keyof typeof MERGE_ATS_PROVIDERS;

export type {MergeATSProviderSlug};
export default MERGE_ATS_PROVIDERS;
