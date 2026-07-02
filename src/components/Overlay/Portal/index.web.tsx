import React, {use, useEffect, useRef} from 'react';
import type {ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {View} from 'react-native';
import asHostElement from '@components/Overlay/libs/asHostElement';
import OVERLAY_PORTAL_DATASET_KEY from '@components/Overlay/libs/portalMarkers';
import {PortalContext} from '@components/Overlay/PortalContext';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

type PortalProps = {
    /** Stacking order of the portalled layer (web only) */
    zIndex?: number;

    /** Content rendered into the portal */
    children: ReactNode;
};

function Portal({zIndex = variables.popoverZIndex, children}: PortalProps) {
    const styles = useThemeStyles();
    const portalRegistration = use(PortalContext);
    const wrapperRef = useRef<View | null>(null);

    useEffect(() => {
        const host = asHostElement(wrapperRef.current);
        if (!host || !portalRegistration) {
            return undefined;
        }
        return portalRegistration.register(host);
    }, [portalRegistration]);

    if (typeof document === 'undefined') {
        return null;
    }
    return createPortal(
        <View
            ref={wrapperRef}
            dataSet={{[OVERLAY_PORTAL_DATASET_KEY]: ''}}
            style={[styles.overlayPortalHost, {zIndex}]}
        >
            {children}
        </View>,
        document.body,
    );
}

export default Portal;
export type {PortalProps};
