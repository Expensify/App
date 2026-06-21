import React from 'react';
import type {ReactNode} from 'react';
import {Modal as RNModal, StyleSheet, View} from 'react-native';
import dismissableLayerStore, {selectTopLayer} from '@components/Overlay/libs/dismissableLayerStore';

type PortalProps = {
    // eslint-disable-next-line react/no-unused-prop-types -- cross-platform contract; consumed by `index.web.tsx`.
    zIndex?: number;
    children: ReactNode;
};

function handleAndroidBack() {
    const top = selectTopLayer(dismissableLayerStore.getSnapshot());
    top?.onDismiss?.();
}

function Portal({children}: PortalProps) {
    return (
        <RNModal
            transparent
            visible
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleAndroidBack}
        >
            <View style={StyleSheet.absoluteFill}>{children}</View>
        </RNModal>
    );
}

export default Portal;
export type {PortalProps};
