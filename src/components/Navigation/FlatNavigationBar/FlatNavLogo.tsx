import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

type FlatNavLogoProps = {
    onPress: () => void;
};

/** Expensify wordmark at the top of the flat navigation bar, which leads Home like the logo in the icon bar. */
function FlatNavLogo({onPress}: FlatNavLogoProps) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ExpensifyWordmark']);

    return (
        <PressableWithFeedback
            role={CONST.ROLE.LINK}
            accessibilityLabel={translate('common.home')}
            testID="ExpensifyLogoButton"
            onPress={onPress}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.EXPENSIFY_LOGO}
        >
            <Icon
                src={icons.ExpensifyWordmark}
                fill={theme.text}
                width={variables.flatNavigationBarLogoWidth}
                height={variables.flatNavigationBarLogoHeight}
            />
        </PressableWithFeedback>
    );
}

export default FlatNavLogo;
