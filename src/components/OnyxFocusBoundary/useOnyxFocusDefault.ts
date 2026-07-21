import {use} from 'react';

import OnyxFocusDefaultContext from './OnyxFocusDefaultContext';

/**
 * The `subscribed` default from the nearest `OnyxFocusBoundary`. For call sites that import
 * `useOnyx` directly from `react-native-onyx` and bypass the wrapper:
 *
 *     const [value] = originalUseOnyx(key, {subscribed: useOnyxFocusDefault()});
 */
function useOnyxFocusDefault(): boolean {
    return use(OnyxFocusDefaultContext) ?? true;
}

export default useOnyxFocusDefault;
