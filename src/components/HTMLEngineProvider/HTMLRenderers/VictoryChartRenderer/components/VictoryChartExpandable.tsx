import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';

import useHover from '@hooks/useHover';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';

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
 * The modal is only mounted after the first expand, because mounting a Modal per chart on the
 * chat path would be needlessly expensive. It stays mounted after closing — unmounting at the end
 * of the close animation can drop a frame and cause a visible flash, especially on dark themes.
 */
function VictoryChartExpandable({children}: VictoryChartExpandableProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {chartContentStyles} = useVictoryChartContext();
    const {hovered, deviceHasHoverSupport, bind: hoverBind} = useHover();
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldRenderModal, setShouldRenderModal] = useState(false);

    const openModal = () => {
        setShouldRenderModal(true);
        setIsExpanded(true);
    };

    // The inline chart never renders wider than its design width (inline scaling caps at 1). On web
    // the wrapper shrinks to its content, but native Yoga stretches a width-less view to the full
    // message column — which would detach the corner-anchored button from the chart on wide surfaces
    // (tablets). Capping the wrapper at the design width keeps the anchor on the chart everywhere,
    // while mw100 still lets it shrink in narrow containers (e.g. the side panel).
    const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;

    // Devices can support both touch and hover (touchscreen laptops, tablets with a pointer). A touch
    // interaction can't produce a hover, so the button must stay visible whenever touch is possible.
    const shouldAlwaysShowButton = !deviceHasHoverSupport || canUseTouchScreen();

    return (
        <>
            <View
                style={[styles.mw100, designWidth !== undefined && StyleUtils.getWidthStyle(designWidth)]}
                onMouseEnter={hoverBind.onMouseEnter}
                onMouseLeave={hoverBind.onMouseLeave}
            >
                {children}
                {/* Shown on hover only (like receipt actions) on hover-only devices; always shown when touch input is possible. */}
                <VictoryChartExpandButton
                    onPress={openModal}
                    shouldShow={hovered || shouldAlwaysShowButton}
                />
            </View>
            {shouldRenderModal && (
                <VictoryChartExpandModal
                    isVisible={isExpanded}
                    onClose={() => setIsExpanded(false)}
                />
            )}
        </>
    );
}

VictoryChartExpandable.displayName = 'VictoryChartExpandable';

export default VictoryChartExpandable;
