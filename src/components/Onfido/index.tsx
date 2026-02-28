import React, {useEffect, useRef} from 'react';
import BaseOnfidoWeb from './BaseOnfidoWeb';
import type {OnfidoElement, OnfidoProps} from './types';

function Onfido({sdkToken, onSuccess, onError, onUserExit}: OnfidoProps) {
    const baseOnfidoRef = useRef<OnfidoElement>(null);

    useEffect(() => {
        const onfidoOut = baseOnfidoRef.current?.onfidoOut;

        const observer = new MutationObserver(() => {
            const fidoRef = baseOnfidoRef.current;
            /** This condition is needed because we are using external embedded content and they are
             * causing two scrollbars to be displayed which make it difficult to accept the consent for
             * the processing of biometric data and sensitive data we are resizing the first iframe so
             * that this problem no longer occurs.
             */
            if (fidoRef) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                const onfidoSdk = fidoRef.querySelector('#onfido-sdk > iframe') as HTMLElement | null;
                if (onfidoSdk) {
                    const viewportHeight = window.innerHeight; // Get the viewport height
                    const desiredHeight = viewportHeight * 0.8;
                    onfidoSdk.style.height = `${desiredHeight}px`;
                }
            }
        });
        if (baseOnfidoRef.current instanceof Node) {
            observer.observe(baseOnfidoRef.current, {attributes: false, childList: true, subtree: true});
        }

        if (!onfidoOut) {
            return;
        }

        onfidoOut.tearDown();

        // Clean up function to remove the observer when component unmounts
        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {}, []);

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

export default Onfido;
