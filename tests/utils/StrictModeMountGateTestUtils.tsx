import {render} from '@testing-library/react-native';

import type {ComponentType, ReactNode} from 'react';

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

/**
 * Mounts a probe child inside the given gate and returns the effect calls the child recorded, so a test can tell a
 * StrictMode double invocation from a single one.
 */
function renderGate(Gate: ComponentType<{children: ReactNode}>) {
    const log: string[] = [];

    render(
        <Gate>
            <Probe log={log} />
        </Gate>,
    );

    return log;
}

export default renderGate;
