// @ts-expect-error TODO: Remove after onyx is typed
import * as Onyx from 'react-native-onyx';

type QueuedOnyxUpdates = Array<typeof Onyx.update>;

export default QueuedOnyxUpdates;
