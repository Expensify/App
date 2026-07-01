import React, {use, useEffect, useState, useSyncExternalStore} from 'react';
import {BackHandler, StyleSheet, View} from 'react-native';
import dismissableLayerStore, {nextLayerMountId, pushDismissableLayer, selectTopLayer} from '@components/Overlay/libs/dismissableLayerStore';
import type {DismissableLayerEntry, DismissableLayerKind} from '@components/Overlay/libs/dismissableLayerStore';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useCallbackRef, {useRefMirror} from '@hooks/useCallbackRef';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import LayerDepthContext from './LayerDepthContext';
import type {DismissableLayerProps} from './types';

function useDismissableLayerWorker(kind: DismissableLayerKind, {onDismiss, escapeBehavior}: Pick<DismissableLayerProps, 'onDismiss' | 'escapeBehavior'>) {
    const parentDepth = use(LayerDepthContext);
    const myDepth = parentDepth + 1;

    const stableDismiss = useCallbackRef(() => onDismiss?.());
    const escapeBehaviorRef = useRefMirror(escapeBehavior);

    const [entry] = useState<DismissableLayerEntry>(() => ({
        kind,
        depth: myDepth,
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

    return {myDepth};
}

// The default and Modal layers differ only by kind, so they share one body.
function PlainLayer({kind, onDismiss, escapeBehavior, children}: {kind: DismissableLayerKind} & Pick<DismissableLayerProps, 'onDismiss' | 'escapeBehavior' | 'children'>) {
    const styles = useThemeStyles();
    const {myDepth} = useDismissableLayerWorker(kind, {onDismiss, escapeBehavior});
    return (
        <LayerDepthContext value={myDepth}>
            <View style={styles.flex1}>{children}</View>
        </LayerDepthContext>
    );
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
    const {myDepth} = useDismissableLayerWorker('floating', {onDismiss, escapeBehavior});
    const onBackdropPress = () => {
        if (shouldCloseOnInteractOutside && !shouldCloseOnInteractOutside(null)) {
            return;
        }
        onDismiss?.();
    };
    return (
        <LayerDepthContext value={myDepth}>
            <View style={styles.flex1}>
                <PressableWithoutFeedback
                    accessibilityLabel={translate('modal.backdropLabel')}
                    sentryLabel="DismissableLayer.FloatingBackdrop"
                    style={StyleSheet.absoluteFill}
                    onPress={onBackdropPress}
                />
                {children}
            </View>
        </LayerDepthContext>
    );
}

DismissableLayer.Modal = ModalLayer;
DismissableLayer.Floating = FloatingLayer;

export default DismissableLayer;
export type {DismissableLayerProps, EscapeBehavior} from './types';
