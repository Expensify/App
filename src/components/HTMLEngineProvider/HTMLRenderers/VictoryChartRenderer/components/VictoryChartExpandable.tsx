import useHover from '@hooks/useHover';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React, {useState} from 'react';
import {View} from 'react-native';

import VictoryChartExpandButton from './VictoryChartExpandButton';
import VictoryChartExpandModal from './VictoryChartExpandModal';

type VictoryChartExpandableProps = {
    /** The inline chart to overlay the expand affordance on */
    children: ReactNode;
};

/**
 * Wraps an inline chart with the expand affordance: a hover-revealed button overlaid on the
 * chart's top-right corner and a full-screen modal that renders the chart enlarged.
 *
 * Hover/expand state lives here — below the chart renderer — so the chart subtree (passed as
 * `children` with a stable element identity) does not re-render on mouse enter/leave.
 * The modal is only mounted after the first expand (and unmounted after its closing animation)
 * because mounting a Modal per chart on the chat path would be needlessly expensive.
 */
function VictoryChartExpandable({children}: VictoryChartExpandableProps) {
    const styles = useThemeStyles();
    const {hovered, deviceHasHoverSupport, bind: hoverBind} = useHover();
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldRenderModal, setShouldRenderModal] = useState(false);

    const openModal = () => {
        setShouldRenderModal(true);
        setIsExpanded(true);
    };

    return (
        <>
            {/* Wrapper anchors the absolutely-positioned expand button to the chart's corner.
                mw100 keeps it from sizing to the chart's design width, so the responsive
                container's onLayout measures the real available width (e.g. in the side panel). */}
            <View
                style={styles.mw100}
                onMouseEnter={hoverBind.onMouseEnter}
                onMouseLeave={hoverBind.onMouseLeave}
            >
                {children}
                {/* Shown on hover only (like receipt actions) on devices with hover support; always shown on touch devices. */}
                <VictoryChartExpandButton
                    onPress={openModal}
                    shouldShow={hovered || !deviceHasHoverSupport}
                />
            </View>
            {shouldRenderModal && (
                <VictoryChartExpandModal
                    isVisible={isExpanded}
                    onClose={() => setIsExpanded(false)}
                    onModalHide={() => setShouldRenderModal(false)}
                />
            )}
        </>
    );
}

VictoryChartExpandable.displayName = 'VictoryChartExpandable';

export default VictoryChartExpandable;
