import type {GpsDraftDetails} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

const isTrackingSelector = (gpsDraftDetails?: OnyxEntry<GpsDraftDetails>) => !!gpsDraftDetails?.isTracking;

// eslint-disable-next-line import/prefer-default-export
export {isTrackingSelector};
