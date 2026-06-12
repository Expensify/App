import type {OnyxEntry} from 'react-native-onyx';
import type {GpsDraftDetails} from '@src/types/onyx';

const isTrackingSelector = (gpsDraftDetails?: OnyxEntry<GpsDraftDetails>) => !!gpsDraftDetails?.isTracking;

// eslint-disable-next-line import/prefer-default-export
export {isTrackingSelector};
