import type {SubPageProps} from '@hooks/useSubPage/types';

import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type EnableTravelSubPageProps = SubPageProps & {
    policy: OnyxEntry<Policy>;
    policyID: string;
    resolvedDomain: string;
};

// eslint-disable-next-line import/prefer-default-export
export type {EnableTravelSubPageProps};
