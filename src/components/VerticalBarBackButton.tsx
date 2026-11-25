import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import FloatingButtonGlass, {isFloatingButtonGlassAvailable} from './FloatingButtonGlass';
import Icon from './Icon';
import {PressableWithoutFeedback} from './Pressable';

type VerticalBarBackButtonProps = {
    /** What a press does, the same as a press on the back button of the header this one stands in for. */
    onPress: () => void;
};

/**
 * The back button of a header as an item of the vertical bar of a foldable iPhone. It is made as the create button that
 * sits in that bar is, so the two look alike, with the arrow a header has.
 */
function VerticalBarBackButton({onPress}: VerticalBarBackButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    // UIKit sizes the slot of an item after the item's view and pads it above and below. The view is shorter than its
    // button by that padding, and the button, centered in it, covers the padding, as the create and scan buttons do.
    const itemSizeStyle = StyleUtils.getWidthAndHeightStyle(variables.componentSizeLarge, variables.componentSizeLarge - 2 * variables.iosVerticalBarItemViewPadding);

    return (
        <PressableWithoutFeedback
            style={[styles.navigationTabBarFABItem, styles.ph0, itemSizeStyle]}
            accessibilityLabel={translate('common.back')}
            onPress={onPress}
            role={CONST.ROLE.BUTTON}
            sentryLabel={CONST.SENTRY_LABEL.HEADER.BACK_BUTTON}
        >
            <View style={[styles.floatingSecondaryActionButton, isFloatingButtonGlassAvailable && styles.floatingActionButtonGlass]}>
                <FloatingButtonGlass tintColor={theme.buttonDefaultBG} />
                <Icon
                    src={icons.BackArrow}
                    fill={theme.icon}
                />
            </View>
        </PressableWithoutFeedback>
    );
}

export default VerticalBarBackButton;
