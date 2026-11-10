/**
 * Covers the area below a linked final action until LegendList has measured the first newer row there. LegendList hides
 * each new row until it is measured. This skeleton is absolutely positioned, so the rows render in place underneath it
 * and nothing moves when it goes away.
 */
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

import {useActionListContext} from '@pages/inbox/ActionListContext';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type SkeletonBelowLinkedActionProps = {
    /** The linked action's index in the LegendList data. The skeleton waits on the row at the next index. */
    linkedActionIndex: number;

    /** Whether rows follow the linked action, so LegendList is about to measure the first of them */
    hasNewerRows: boolean;

    /** Called when LegendList has measured the first newer row, or finds it off screen, so the list can stop rendering this skeleton */
    onNewerRowMeasured: () => void;
};

function SkeletonBelowLinkedAction({linkedActionIndex, hasNewerRows, onNewerRowMeasured}: SkeletonBelowLinkedActionProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {getListRef} = useActionListContext();
    const [isNewerRowMeasured, setIsNewerRowMeasured] = useState(false);

    useEffect(() => {
        if (!hasNewerRows) {
            return;
        }
        let frame: number;
        const checkNewerRowMeasured = () => {
            const listState = getListRef()?.current?.getState?.();
            // A row without a container is off screen, so there is nothing left to cover.
            if (listState?.sizeAtIndex?.(linkedActionIndex + 1) === undefined && listState?.elementAtIndex?.(linkedActionIndex + 1)) {
                frame = requestAnimationFrame(checkNewerRowMeasured);
                return;
            }
            // Local state re-renders only this view, so the skeleton goes away in the frame the row appears. The list
            // re-renders afterwards to drop it for good.
            setIsNewerRowMeasured(true);
            onNewerRowMeasured();
        };
        frame = requestAnimationFrame(checkNewerRowMeasured);
        return () => cancelAnimationFrame(frame);
    }, [getListRef, hasNewerRows, linkedActionIndex, onNewerRowMeasured]);

    if (isNewerRowMeasured) {
        return null;
    }

    return (
        <View
            pointerEvents="none"
            style={[styles.pAbsolute, styles.tFull, styles.l0, styles.r0, styles.appBG]}
        >
            <ReportActionsSkeletonView shouldAnimate={!isOffline} />
        </View>
    );
}

export default SkeletonBelowLinkedAction;
