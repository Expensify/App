import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import compose from '@libs/compose';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';

const propTypes = {
    /** Override the green headline copy */
    customHeadline: PropTypes.string,

    /** Override the smaller hero body copy below the headline */
    customHeroBody: PropTypes.string,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    customHeadline: '',
    customHeroBody: '',
};

function SignInHeroCopy(props) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.flex1, styles.alignSelfCenter, styles.gap7]}>
            <Text
                style={[
                    styles.loginHeroHeader,
                    props.isMediumScreenWidth && StyleUtils.getFontSizeStyle(variables.fontSizeSignInHeroMedium),
                    props.isLargeScreenWidth && StyleUtils.getFontSizeStyle(variables.fontSizeSignInHeroLarge),
                ]}
            >
                {props.customHeadline || props.translate('login.hero.header')}
            </Text>
            <Text style={[styles.loginHeroBody]}>{props.customHeroBody || props.translate('login.hero.body')}</Text>
        </View>
    );
}

SignInHeroCopy.displayName = 'SignInHeroCopy';
SignInHeroCopy.propTypes = propTypes;
SignInHeroCopy.defaultProps = defaultProps;

export default compose(withWindowDimensions, withLocalize)(SignInHeroCopy);
