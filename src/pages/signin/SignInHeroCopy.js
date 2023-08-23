import {View} from 'react-native';
import PropTypes from 'prop-types';
import React from 'react';
import Text from '../../components/Text';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import * as StyleUtils from '../../styles/StyleUtils';
import styles from '../../styles/styles';
import variables from '../../styles/variables';

const propTypes = {
    /** Override the green headline copy */
    customHeadline: PropTypes.string,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    customHeadline: '',
};
function SignInHeroCopy(props) {
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
            <Text style={[styles.loginHeroBody]}>{props.translate('login.hero.body')}</Text>
        </View>
    );
}

SignInHeroCopy.displayName = 'SignInHeroCopy';
SignInHeroCopy.propTypes = propTypes;
SignInHeroCopy.defaultProps = defaultProps;

export default compose(withWindowDimensions, withLocalize)(SignInHeroCopy);
