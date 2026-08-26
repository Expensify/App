import type {SubPageProps} from '@hooks/useSubPage/types';

import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type EnableTravelSubPageProps = SubPageProps & {
    /** The workspace being enabled for travel */
    policy: OnyxEntry<Policy>;

    /** ID of the workspace being enabled for travel */
    policyID: string;

    /** The booking domain resolved for this flow session (selected in the domain step, or derived from the admins' domains) */
    resolvedDomain: string;

    /**
     * Name of the first prerequisite step (in canonical flow order) that's still genuinely incomplete, computed
     * live from current data rather than the frozen step list — undefined once everything is satisfied. subPage
     * is URL-controlled, so a direct link could land a user on a later step without having completed earlier
     * ones; the terms step uses this as a final submit-time gate against that.
     */
    firstIncompletePrerequisitePageName?: string;
};

// eslint-disable-next-line import/prefer-default-export
export type {EnableTravelSubPageProps};
