import type {DeferredUpdatesDictionary} from '@libs/actions/OnyxUpdateManager/types';
import createProxyForObject from '@src/utils/createProxyForObject';

const deferredUpdatesValue = {deferredUpdates: {} as DeferredUpdatesDictionary};

const deferredUpdatesProxy = createProxyForObject(deferredUpdatesValue);

export default deferredUpdatesProxy;
