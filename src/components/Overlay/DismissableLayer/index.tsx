import React, {use, useEffect, useState, useSyncExternalStore} from 'react';
import {BackHandler, StyleSheet, View} from 'react-native';
import dismissableLayerStore, {nextLayerMountId, pushDismissableLayer, selectTopLayer} from '@components/Overlay/libs/dismissableLayerStore';
import type {DismissableLayerEntry, DismissableLayerKind} from '@components/Overlay/libs/dismissableLayerStore';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useCallbackRef from '@hooks/useCallbackRef';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import LayerDepthContext from './LayerDepthContext';
import type {DismissableLayerProps} from './types';

function useDismissableLayerWorker(kind: DismissableLayerKind, {onDismiss, escapeBehavior}: Pick<DismissableLayerProps, 'onDismiss' | 'escapeBehavior'>) {
    const parentDepth = use(LayerDepthContext);
    const myDepth = parentDepth + 1;

    const stableDismiss = useCallbackRef(() => onDismiss?.());

    const [entry] = useState<DismissableLayerEntry>(() => ({
        kind,
        depth: myDepth,
        mountId: nextLayerMountId(),
        onDismiss: stableDismiss,
    }));
    const top = useSyncExternalStore(dismissableLayerStore.subscribe, () => selectTopLayer(dismissableLayerStore.getSnapshot()));
    const isTop = top === entry;

    useEffect(() => pushDismissableLayer(entry), [entry]);

    useEffect(() => {
        if (!isTop || escapeBehavior === 'ignore') {
            return undefined;
        }
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            stableDismiss();
            return true;
        });
        return () => subscription.remove();
    }, [isTop, escapeBehavior, stableDismiss]);

    return {myDepth};
}

function DismissableLayer({onDismiss, escapeBehavior, children}: DismissableLayerProps) {
    const styles = useThemeStyles();
    const {myDepth} = useDismissableLayerWorker('floating', {onDismiss, escapeBehavior});
    return (
        <LayerDepthContext value={myDepth}>
            <View style={styles.flex1}>{children}</View>
        </LayerDepthContext>
    );
}

function ModalLayer({onDismiss, escapeBehavior, children}: DismissableLayerProps) {
    const styles = useThemeStyles();
    const {myDepth} = useDismissableLayerWorker('modal', {onDismiss, escapeBehavior});
    return (
        <LayerDepthContext value={myDepth}>
            <View style={styles.flex1}>{children}</View>
        </LayerDepthContext>
    );
}

function FloatingLayer({onDismiss, escapeBehavior, children}: DismissableLayerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {myDepth} = useDismissableLayerWorker('floating', {onDismiss, escapeBehavior});
    return (
        <LayerDepthContext value={myDepth}>
            <View style={styles.flex1}>
                <PressableWithoutFeedback
                    accessibilityLabel={translate('modal.backdropLabel')}
                    sentryLabel="DismissableLayer.FloatingBackdrop"
                    style={StyleSheet.absoluteFill}
                    onPress={onDismiss}
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
