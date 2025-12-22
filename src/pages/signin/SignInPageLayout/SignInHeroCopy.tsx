import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type {SignInPageLayoutProps} from './types';

type SignInHeroCopyProps = Pick<SignInPageLayoutProps, 'customHeadline' | 'customHeroBody'>;

function SignInHeroCopy({customHeadline, customHeroBody}: SignInHeroCopyProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isMediumScreenWidth, isLargeScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flex1, styles.alignSelfCenter, styles.gap7]}>
            <Text
                style={[
                    styles.loginHeroHeader,
                    isMediumScreenWidth && StyleUtils.getFontSizeStyle(variables.fontSizeSignInHeroMedium),
                    isLargeScreenWidth && StyleUtils.getFontSizeStyle(variables.fontSizeSignInHeroLarge),
                ]}
            >
                {customHeadline ?? translate('login.hero.header')}
            </Text>
            <Text style={[styles.loginHeroBody]}>{customHeroBody ?? translate('login.hero.body')}</Text>
        </View>
    );
}

export default SignInHeroCopy;
