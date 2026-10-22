import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Text from './Text';
import Tooltip from './Tooltip';

/**
 * Height of the header: its 20px row, 4px above it (20px from the edge with the 16px top padding of the list, or of the
 * sheet) and 20px below. Callers add it to the room they give the list, so the two never disagree.
 */
const SELECTION_LIST_POPOVER_HEADER_HEIGHT = variables.iconSizeNormal + 24;

type SelectionListPopoverHeaderProps = {
    /** Name of the field the list picks for */
    title: string;

    /** Closes the list */
    onBackButtonPress: () => void;

    /** Sentry label for the back button, so each list's presses are attributed to it */
    backButtonSentryLabel: string;

    /** Actions shown at the right end of the header */
    children?: ReactNode;
};

/**
 * Header above a selection list in a pop-over or bottom sheet: the field's name, and on a narrow layout, where the sheet
 * can cover the whole screen, a back button that closes it.
 */
function SelectionListPopoverHeader({title, onBackButtonPress, backButtonSentryLabel, children}: SelectionListPopoverHeaderProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match PopoverWithMeasuredContent's dock decision (bottom-docked only when isSmallScreenWidth)
    const {isSmallScreenWidth} = useResponsiveLayout();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.ph5, styles.pt1, styles.pb5, StyleUtils.getHeight(SELECTION_LIST_POPOVER_HEADER_HEIGHT)]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.flex1]}>
                {isSmallScreenWidth && (
                    <Tooltip text={translate('common.back')}>
                        <PressableWithFeedback
                            accessibilityLabel={translate('common.back')}
                            role={CONST.ROLE.BUTTON}
                            onPress={onBackButtonPress}
                            shouldUseAutoHitSlop
                            sentryLabel={backButtonSentryLabel}
                        >
                            <Icon
                                src={icons.BackArrow}
                                fill={theme.icon}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                            />
                        </PressableWithFeedback>
                    </Tooltip>
                )}
                <Text
                    style={[styles.textLabelSupporting, styles.flex1]}
                    numberOfLines={1}
                >
                    {title}
                </Text>
            </View>
            {children}
        </View>
    );
}

export default SelectionListPopoverHeader;
export {SELECTION_LIST_POPOVER_HEADER_HEIGHT};
