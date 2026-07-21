import dismissableLayerStore, {selectTopLayer} from '@components/Overlay/libs/dismissableLayerStore';

import type {ReactNode} from 'react';

import React from 'react';
import {Modal as RNModal, StyleSheet, View} from 'react-native';

type PortalProps = {
    /** Stacking order of the portalled layer (web only) */
    // eslint-disable-next-line react/no-unused-prop-types -- cross-platform contract; consumed by `index.web.tsx`.
    zIndex?: number;

    /** Content rendered into the portal */
    children: ReactNode;
};

function handleAndroidBack() {
    // Only Android-back path — RNModal suppresses BackHandler subscribers while mounted.
    const top = selectTopLayer(dismissableLayerStore.getSnapshot());
    if (top?.escapeBehaviorRef?.current === 'ignore') {
        return;
    }
    top?.onDismiss?.();
}

function Portal({children}: PortalProps) {
    return (
        <RNModal
            transparent
            visible
            animationType="none"
            statusBarTranslucent
            supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
            onRequestClose={handleAndroidBack}
        >
            <View style={StyleSheet.absoluteFill}>{children}</View>
        </RNModal>
    );
}

export default Portal;
export type {PortalProps};
