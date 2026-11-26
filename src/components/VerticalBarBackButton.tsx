import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import FloatingButtonGlass from './FloatingButtonGlass';
import Icon from './Icon';
import {PressableWithoutFeedback} from './Pressable';

type VerticalBarBackButtonProps = {
    /** What a press does, the same as a press on the back button of the header this one stands in for. */
    onPress: () => void;
};

/**
 * The back button of a header as an item of the vertical bar of a foldable iPhone. It is made as the create button that
 * sits in that bar is, so the two look alike, with the arrow a header has. The vertical bar only exists on iOS versions
 * that draw liquid glass, so the button is always glass.
 */
function VerticalBarBackButton({onPress}: VerticalBarBackButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);

    return (
        <PressableWithoutFeedback
            style={[styles.navigationTabBarFABItem, styles.ph0, styles.verticalBarItem]}
            accessibilityLabel={translate('common.back')}
            onPress={onPress}
            role={CONST.ROLE.BUTTON}
            sentryLabel={CONST.SENTRY_LABEL.HEADER.BACK_BUTTON}
        >
            <View style={[styles.floatingActionButton, styles.floatingActionButtonGlass]}>
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
