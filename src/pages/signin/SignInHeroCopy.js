
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
    <View style={[styles.flex1, {backgroundColor: 'orange'}]}>
        <View style={[]}>
            <Text style={[styles.flex1, styles.loginHeroHeader, {fontSize: props.isMediumScreenWidth ? 54 : 72}]}>
                {props.translate('login.hero.header')}
            </Text>
        </View>
        <View style={[]}>
            <Text style={[styles.flex1, styles.loginHeroBody, {fontSize: props.isMediumScreenWidth ? 24 : 16}]}>
                {props.translate('login.hero.body')}
            </Text>
        </View>
    </View>
);

SignInHeroCopy.displayName = 'SignInHeroCopy';
SignInHeroCopy.propTypes = propTypes;

export default compose(
    withWindowDimensions,
    withLocalize,
)(SignInHeroCopy);

