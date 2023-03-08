
import {View} from 'react-native';
import React from 'react';
import Text from '../../components/Text';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import styles from '../../styles/styles';

const propTypes = {
    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const SignInHeroCopy = props => (
    <View style={[styles.flex1, styles.alignSelfCenter, {backgroundColor: 'transparent'}, {gap: 36}]}>
        <Text style={[styles.loginHeroHeader, props.isMediumScreenWidth ? {fontSize: 50} : {}]}>
            {props.translate('login.hero.header')}
        </Text>
        <Text style={[styles.loginHeroBody, props.isMediumScreenWidth ? {fontSize: 20} : {}]}>
            {props.translate('login.hero.body')}
        </Text>
    </View>
);

SignInHeroCopy.displayName = 'SignInHeroCopy';
SignInHeroCopy.propTypes = propTypes;

export default compose(
    withWindowDimensions,
    withLocalize,
)(SignInHeroCopy);

