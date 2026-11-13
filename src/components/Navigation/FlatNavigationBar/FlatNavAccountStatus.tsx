import Hoverable from '@components/Hoverable';
import {getCollapseFadeStyle} from '@components/Navigation/SearchSidebarCollapseStore';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';
import getStatusTooltipText from '@libs/getStatusTooltipText';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

type FlatNavAccountStatusProps = {
    isCollapsed?: boolean;
};

/**
 * The signed-in user's emoji status on the right of the flat navigation bar's Account row, with the status text in a
 * tooltip. In the expanded bar the status sits here instead of as a badge on the avatar, which would crowd the avatar's
 * ring and indicator dot.
 */
function FlatNavAccountStatus({isCollapsed = false}: FlatNavAccountStatusProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, dateFnsLocale} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const emojiCode = currentUserPersonalDetails.status?.emojiCode ?? '';
    if (!emojiCode) {
        return null;
    }

    const collapseFadeStyle = getCollapseFadeStyle(isCollapsed);

    const timezone = currentUserPersonalDetails.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected;
    const formattedClearAfterDate = DateUtils.getStatusUntilDate(translate, dateFnsLocale, currentUserPersonalDetails.status?.clearAfter ?? '', timezone, timezone);
    const tooltipText = getStatusTooltipText(currentUserPersonalDetails.status?.text ?? '', formattedClearAfterDate);

    return (
        <Animated.View style={collapseFadeStyle}>
            <Tooltip
                text={tooltipText}
                shiftVertical={-4}
            >
                {/* Tooltip shows on mouse handlers it injects into its child, which Hoverable does not forward, so its target is a plain View */}
                <View>
                    <Hoverable>
                        {(isHovered) => (
                            <View
                                testID="FlatNavAccountStatus"
                                style={[
                                    styles.alignItemsCenter,
                                    styles.justifyContentCenter,
                                    StyleUtils.getWidthAndHeightStyle(variables.componentSizeSmall),
                                    styles.borderRadiusCircle,
                                    isHovered ? styles.buttonHoveredBG : styles.buttonDefaultBG,
                                ]}
                            >
                                <Text numberOfLines={1}>{emojiCode}</Text>
                            </View>
                        )}
                    </Hoverable>
                </View>
            </Tooltip>
        </Animated.View>
    );
}

export default FlatNavAccountStatus;
