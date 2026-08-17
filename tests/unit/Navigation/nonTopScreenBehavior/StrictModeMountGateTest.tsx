import {render, screen} from '@testing-library/react-native';

import StrictModeMountGate from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/StrictModeMountGate';

import React, {useEffect} from 'react';
import {View} from 'react-native';

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
    it('runs the child effect through the full effect, cleanup, effect cycle on mount', () => {
        const log: string[] = [];

        render(
            <StrictModeMountGate>
                <Probe log={log} />
            </StrictModeMountGate>,
        );

        expect(log).toEqual(['effect', 'cleanup', 'effect']);
    });

    it('renders the children', () => {
        render(
            <StrictModeMountGate>
                <View testID="content" />
            </StrictModeMountGate>,
        );

        expect(screen.getByTestId('content')).toBeTruthy();
    });

    it('cleans the child effect up on unmount', () => {
        const log: string[] = [];

        const {unmount} = render(
            <StrictModeMountGate>
                <Probe log={log} />
            </StrictModeMountGate>,
        );
        unmount();

        expect(log).toEqual(['effect', 'cleanup', 'effect', 'cleanup']);
    });
});
