import {useProductTrainingContext} from '@components/ProductTrainingContext';
import Text from '@components/Text';

import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissProductTraining} from '@libs/actions/Welcome';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

/**
 * The tooltip on the workspace menu's Connections item telling users their integrations moved there. Reaching
 * Connections, or leaving the page it was first shown on, counts as dismissing it, so it only shows once.
 */
function useConnectionsMovedTooltip(shouldShow: boolean, activeRoute: string | undefined, isWorkspacesTabFocused: boolean) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {shouldShowProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.CONNECTIONS_MOVED, shouldShow);
    const shownOnRouteRef = useRef<string | undefined>(undefined);
    const isOnConnectionsPage = activeRoute === SCREENS.WORKSPACE.CONNECTIONS;

    useEffect(() => {
        if (shouldShowProductTrainingTooltip && isOnConnectionsPage) {
            shownOnRouteRef.current = undefined;
            dismissProductTraining(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.CONNECTIONS_MOVED);
            return;
        }
        if (shouldShowProductTrainingTooltip && !shownOnRouteRef.current) {
            shownOnRouteRef.current = activeRoute;
        }
        const shownOnRoute = shownOnRouteRef.current;
        if (!shownOnRoute || (shownOnRoute === activeRoute && isWorkspacesTabFocused)) {
            return;
        }
        shownOnRouteRef.current = undefined;
        dismissProductTraining(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.CONNECTIONS_MOVED);
    }, [activeRoute, isOnConnectionsPage, isWorkspacesTabFocused, shouldShowProductTrainingTooltip]);

    // Going back from the workspace removes the page without changing the route seen above
    useBeforeRemove(() => {
        if (!shownOnRouteRef.current) {
            return;
        }
        shownOnRouteRef.current = undefined;
        dismissProductTraining(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.CONNECTIONS_MOVED);
    });

    const hideTooltip = () => {
        shownOnRouteRef.current = undefined;
        hideProductTrainingTooltip();
    };

    const renderTooltipContent = () => (
        <View
            fsClass={CONST.FULLSTORY.CLASS.UNMASK}
            style={[styles.pv2, styles.ph2]}
        >
            <Text style={styles.productTrainingTooltipText}>
                <Text style={[styles.productTrainingTooltipText, styles.strong, StyleUtils.getColorStyle(theme.tooltipHighlightText)]}>{translate('common.new')}</Text>{' '}
                {translate('productTrainingTooltip.connectionsMoved')}
            </Text>
        </View>
    );

    return {shouldShowTooltip: shouldShowProductTrainingTooltip && !isOnConnectionsPage, hideTooltip, renderTooltipContent};
}

export default useConnectionsMovedTooltip;
