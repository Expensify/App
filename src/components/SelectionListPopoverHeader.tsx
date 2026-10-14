import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

/** Height of the header, which callers add to the room they give the list */
const SELECTION_LIST_POPOVER_HEADER_HEIGHT = variables.componentSizeNormal;

type SelectionListPopoverHeaderProps = {
    /** Name of the field the list picks for */
    title: string;

    /** Closes the list */
    onBackButtonPress: () => void;

    /** Actions shown at the right end of the header */
    children?: ReactNode;
};

/** Header above a selection list in a pop-over or bottom sheet: a back button that closes it, and the field's name. */
function SelectionListPopoverHeader({title, onBackButtonPress, children}: SelectionListPopoverHeaderProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.ph5, styles.pt1, styles.pb4, StyleUtils.getHeight(SELECTION_LIST_POPOVER_HEADER_HEIGHT)]}>
            <Tooltip text={translate('common.back')}>
                <PressableWithFeedback
                    accessibilityLabel={translate('common.back')}
                    role={CONST.ROLE.BUTTON}
                    onPress={onBackButtonPress}
                    shouldUseAutoHitSlop
                    sentryLabel={CONST.SENTRY_LABEL.SELECTION_LIST_POPOVER_HEADER.BACK_BUTTON}
                >
                    <Icon
                        src={icons.BackArrow}
                        fill={theme.icon}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                </PressableWithFeedback>
            </Tooltip>
            <Text
                style={[styles.textLabelSupporting, styles.flex1]}
                numberOfLines={1}
            >
                {title}
            </Text>
            {children}
        </View>
    );
}

export default SelectionListPopoverHeader;
export {SELECTION_LIST_POPOVER_HEADER_HEIGHT};
