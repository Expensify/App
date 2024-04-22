import type DeferredUpdatesDictionary from '@libs/actions/OnyxUpdateManager/types';
import createProxyForValue from '@src/utils/createProxyForValue';

const deferredUpdatesValue = {deferredUpdates: {} as DeferredUpdatesDictionary};

const deferredUpdatesProxy = createProxyForValue(deferredUpdatesValue);

export default deferredUpdatesProxy;
