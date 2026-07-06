import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getClickedTargetLocation from '@libs/getClickedTargetLocation';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import Popover from './Popover';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

type WorkspaceCardLabelProps = {
    /** Translated label shown in the header and as the popover title */
    title: string;

    /** Translated description shown in the popover body */
    description: string;

    /** Formatted value shown as the headline */
    displayValue: string;

    /** Optional style applied to the value headline */
    valueStyle?: StyleProp<TextStyle>;

    /** Optional content rendered to the right of the value (e.g. a settle balance button) */
    valueAccessory?: ReactNode;

    /** Optional content rendered below the header and value block (e.g. a settle date hint) */
    footer?: ReactNode;

    /** Optional content rendered inside the popover below the description, given a callback to close the popover */
    renderPopoverContent?: (closePopover: () => void) => ReactNode;

    /** Additional style props applied to the header row */
    style?: StyleProp<ViewStyle>;

    /** When true the label stretches to fill its share of the row (used to evenly distribute multiple labels). When false it shrinks to its content width. */
    shouldFillContainer?: boolean;
};

/**
 * Header + value + info tooltip used to surface a single card statistic (e.g. current balance, remaining limit).
 * Shared between the Expensify Card and company card balance sections so the tooltip/anchor logic lives in one place.
 */
function WorkspaceCardLabel({title, description, displayValue, valueStyle, valueAccessory, footer, renderPopoverContent, style, shouldFillContainer = true}: WorkspaceCardLabelProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Info']);

    const [isVisible, setVisible] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({top: 0, left: 0});
    const anchorRef = useRef(null);

    useEffect(() => {
        if (!anchorRef.current || !isVisible) {
            return;
        }

        const position = getClickedTargetLocation(anchorRef.current);
        const BOTTOM_MARGIN_OFFSET = 3;

        setAnchorPosition({
            top: position.top + position.height + BOTTOM_MARGIN_OFFSET,
            left: position.left,
        });
    }, [isVisible, windowWidth]);

    return (
        <View style={shouldFillContainer ? styles.flex1 : undefined}>
            <View style={styles.flex1}>
                <View
                    ref={anchorRef}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.mb1, style]}
                >
                    <Text style={[styles.mutedNormalTextLabel, styles.mr1]}>{title}</Text>
                    <PressableWithFeedback
                        accessibilityLabel={title}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        onPress={() => setVisible(true)}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE_CARDS_LIST.INFO_BUTTON}
                    >
                        <Icon
                            src={icons.Info}
                            width={variables.iconSizeExtraSmall}
                            height={variables.iconSizeExtraSmall}
                            fill={theme.icon}
                        />
                    </PressableWithFeedback>
                </View>
                <View style={[styles.flexRow, styles.flexWrap]}>
                    <Text style={[styles.shortTermsHeadline, valueStyle]}>{displayValue}</Text>
                    {valueAccessory}
                </View>
            </View>
            {footer}
            <Popover
                onClose={() => setVisible(false)}
                isVisible={isVisible}
                outerStyle={!shouldUseNarrowLayout ? styles.pr5 : undefined}
                innerContainerStyle={!shouldUseNarrowLayout ? styles.cardLabelTooltipContainer : undefined}
                anchorRef={anchorRef}
                anchorPosition={anchorPosition}
            >
                <View style={styles.p4}>
                    <Text
                        numberOfLines={1}
                        style={[styles.optionDisplayName, styles.textStrong, styles.mb2]}
                    >
                        {title}
                    </Text>
                    <Text style={[styles.textLabelSupporting, styles.lh16]}>{description}</Text>
                    {renderPopoverContent?.(() => setVisible(false))}
                </View>
            </Popover>
        </View>
    );
}

WorkspaceCardLabel.displayName = 'WorkspaceCardLabel';

export default WorkspaceCardLabel;
