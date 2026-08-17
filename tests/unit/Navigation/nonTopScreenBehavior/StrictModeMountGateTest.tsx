import {render} from '@testing-library/react-native';

// The gate is imported by name, because the default export of that module is picked by __DEV__ and
// CONFIG.USE_ACTIVITY_SCREEN_STRICT_MODE_IN_DEV, and that flag is meant to be turned off locally while profiling.
import {StrictModeMountGate} from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/StrictModeMountGate';

import React, {useEffect} from 'react';

function Probe({log}: {log: string[]}) {
    useEffect(() => {
        log.push('effect');
        return () => {
            log.push('cleanup');
        };
    }, [log]);
    return null;
}

describe('StrictModeMountGate', () => {
    it('mounts the children into an already committed StrictMode, so their effects run the full effect, cleanup, effect cycle', () => {
        const log: string[] = [];

        render(
            <StrictModeMountGate>
                <Probe log={log} />
            </StrictModeMountGate>,
        );

        expect(log).toEqual(['effect', 'cleanup', 'effect']);
    });
});
