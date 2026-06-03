import {useCallback} from 'react';
import {Gesture} from 'react-native-gesture-handler';
import {useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {TOOLTIP_BAR_GAP} from '@components/Charts/hooks/useChartInteractions';
import useChartInteractionState from '@components/Charts/hooks/useChartInteractionState';

type BarHitTarget = {
    left: number;
    right: number;
    top: number;
    bottom: number;
    tooltipIndex: number;
    centerX: number;
    barTopY: number;
};

const DEFAULT_BAR_WIDTH = 20;

/**
 * Finds the bar hit target under the cursor, preferring the closest bar when several overlap.
 */
function findBarAtCursor(targets: BarHitTarget[], cursorX: number, cursorY: number): BarHitTarget | null {
    'worklet';

    let bestTarget: BarHitTarget | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const target of targets) {
        if (cursorX >= target.left && cursorX <= target.right && cursorY >= target.top && cursorY <= target.bottom) {
            const targetCenterY = (target.top + target.bottom) / 2;
            const distance = Math.abs(cursorY - targetCenterY);

            if (distance < bestDistance) {
                bestDistance = distance;
                bestTarget = target;
            }
        }
    }

    return bestTarget;
}

/**
 * Manages hover and tap gestures for VirtualCFO bar chart tooltips.
 */
function useVictoryChartBarTooltips() {
    const {state: chartInteractionState} = useChartInteractionState();
    const hitTargets = useSharedValue<BarHitTarget[]>([]);

    const updateHitTargets = useCallback(
        (targets: BarHitTarget[]) => {
            hitTargets.set(targets);
        },
        [hitTargets],
    );

    const applyHitTarget = (target: BarHitTarget) => {
        'worklet';

        chartInteractionState.matchedIndex.set(target.tooltipIndex);
        chartInteractionState.x.position.set(target.centerX);
        chartInteractionState.x.value.set(target.tooltipIndex);
        chartInteractionState.y.y.position.set(target.barTopY);
    };

    const hoverGesture = () =>
        Gesture.Hover()
            .onBegin((event) => {
                'worklet';

                chartInteractionState.isActive.set(true);
                chartInteractionState.cursor.x.set(event.x);
                chartInteractionState.cursor.y.set(event.y);
                const target = findBarAtCursor(hitTargets.get(), event.x, event.y);
                if (target) {
                    applyHitTarget(target);
                }
            })
            .onUpdate((event) => {
                'worklet';

                chartInteractionState.isActive.set(true);
                chartInteractionState.cursor.x.set(event.x);
                chartInteractionState.cursor.y.set(event.y);
                const target = findBarAtCursor(hitTargets.get(), event.x, event.y);
                if (target) {
                    applyHitTarget(target);
                } else {
                    chartInteractionState.matchedIndex.set(-1);
                }
            })
            .onEnd(() => {
                'worklet';

                chartInteractionState.isActive.set(false);
            });

    const tapGesture = () =>
        Gesture.Tap().onEnd((event) => {
            'worklet';

            chartInteractionState.cursor.x.set(event.x);
            chartInteractionState.cursor.y.set(event.y);
            const target = findBarAtCursor(hitTargets.get(), event.x, event.y);
            if (target) {
                applyHitTarget(target);
                chartInteractionState.isActive.set(true);
                return;
            }

            chartInteractionState.isActive.set(false);
            chartInteractionState.matchedIndex.set(-1);
        });

    const isTooltipActive = useDerivedValue(() => chartInteractionState.isActive.get() && chartInteractionState.matchedIndex.get() >= 0);

    const initialTooltipPosition = useDerivedValue(() => ({
        x: chartInteractionState.x.position.get(),
        y: chartInteractionState.y.y.position.get() - TOOLTIP_BAR_GAP,
    }));

    const plotGestures = Gesture.Race(hoverGesture(), tapGesture());

    return {
        plotGestures,
        updateHitTargets,
        matchedIndex: chartInteractionState.matchedIndex,
        isTooltipActive,
        initialTooltipPosition,
    };
}

export {useVictoryChartBarTooltips, DEFAULT_BAR_WIDTH, findBarAtCursor};
export type {BarHitTarget};
