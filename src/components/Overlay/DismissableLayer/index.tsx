import dismissableLayerStore, {nextLayerMountId, pushDismissableLayer, selectTopLayer} from '@components/Overlay/libs/dismissableLayerStore';
import type {DismissableLayerEntry, DismissableLayerKind} from '@components/Overlay/libs/dismissableLayerStore';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import useCallbackRef, {useRefMirror} from '@hooks/useCallbackRef';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React, {useEffect, useState, useSyncExternalStore} from 'react';
import {BackHandler, StyleSheet, View} from 'react-native';

import type {DismissableLayerProps} from './types';

function useDismissableLayerWorker(kind: DismissableLayerKind, {onDismiss, escapeBehavior}: Pick<DismissableLayerProps, 'onDismiss' | 'escapeBehavior'>) {
    const stableDismiss = useCallbackRef(() => onDismiss?.());
    const escapeBehaviorRef = useRefMirror(escapeBehavior);

    const [entry] = useState<DismissableLayerEntry>(() => ({
        kind,
        mountId: nextLayerMountId(),
        onDismiss: stableDismiss,
        escapeBehaviorRef,
    }));
    const top = useSyncExternalStore(dismissableLayerStore.subscribe, () => selectTopLayer(dismissableLayerStore.getSnapshot()));
    const isTop = top === entry;

    useEffect(() => pushDismissableLayer(entry), [entry]);

    useEffect(() => {
        // Defensive — RNModal suppresses BackHandler, so this only fires for standalone DismissableLayer use.
        if (!isTop) {
            return undefined;
        }
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (escapeBehavior !== 'ignore') {
                stableDismiss();
            }
            return true;
        });
        return () => subscription.remove();
    }, [isTop, escapeBehavior, stableDismiss]);
}

// The default and Modal layers differ only by kind, so they share one body.
function PlainLayer({kind, onDismiss, escapeBehavior, children}: {kind: DismissableLayerKind} & Pick<DismissableLayerProps, 'onDismiss' | 'escapeBehavior' | 'children'>) {
    const styles = useThemeStyles();
    useDismissableLayerWorker(kind, {onDismiss, escapeBehavior});
    return <View style={styles.flex1}>{children}</View>;
}

function DismissableLayer({onDismiss, escapeBehavior, children}: DismissableLayerProps) {
    return (
        <PlainLayer
            kind="floating"
            onDismiss={onDismiss}
            escapeBehavior={escapeBehavior}
        >
            {children}
        </PlainLayer>
    );
}

function ModalLayer({onDismiss, escapeBehavior, children}: DismissableLayerProps) {
    return (
        <PlainLayer
            kind="modal"
            onDismiss={onDismiss}
            escapeBehavior={escapeBehavior}
        >
            {children}
        </PlainLayer>
    );
}

function FloatingLayer({onDismiss, escapeBehavior, shouldCloseOnInteractOutside, children}: DismissableLayerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    useDismissableLayerWorker('floating', {onDismiss, escapeBehavior});
    const onBackdropPress = () => {
        if (shouldCloseOnInteractOutside && !shouldCloseOnInteractOutside(null)) {
            return;
        }
        onDismiss?.();
    };
    return (
        <View style={styles.flex1}>
            <PressableWithoutFeedback
                accessibilityLabel={translate('modal.backdropLabel')}
                sentryLabel="DismissableLayer.FloatingBackdrop"
                style={StyleSheet.absoluteFill}
                onPress={onBackdropPress}
            />
            {children}
        </View>
    );
}

DismissableLayer.Modal = ModalLayer;
DismissableLayer.Floating = FloatingLayer;

export default DismissableLayer;
export type {DismissableLayerProps, EscapeBehavior} from './types';
