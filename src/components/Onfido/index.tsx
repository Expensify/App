import React, {useEffect, useRef} from 'react';
import BaseOnfidoWeb from './BaseOnfidoWeb';
import type {OnfidoElement, OnfidoProps} from './types';

function Onfido({sdkToken, onSuccess, onError, onUserExit}: OnfidoProps) {
    const baseOnfidoRef = useRef<OnfidoElement>(null);

    useEffect(
        () => () => {
            const onfidoOut = baseOnfidoRef.current?.onfidoOut;

            if (!onfidoOut) {
                return;
            }

            onfidoOut.tearDown();
        },
        [],
    );

    return (
        <BaseOnfidoWeb
            ref={baseOnfidoRef}
            sdkToken={sdkToken}
            onSuccess={onSuccess}
            onError={onError}
            onUserExit={onUserExit}
        />
    );
}

Onfido.displayName = 'Onfido';

export default Onfido;
