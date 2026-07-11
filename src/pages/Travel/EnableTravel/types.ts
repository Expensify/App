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
};

// eslint-disable-next-line import/prefer-default-export
export type {EnableTravelSubPageProps};
