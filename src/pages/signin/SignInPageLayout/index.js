import React from 'react';
import {SafeAreaView} from 'react-native';
import styles from '../../../styles/styles';
import SignInPageLayoutNarrow from './SignInPageLayoutNarrow';
import SignInPageLayoutWide from './SignInPageLayoutWide';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const SignInPageLayout = props => (
    <SafeAreaView style={[styles.signInPage]}>
        {!props.isSmallScreenWidth
            // eslint-disable-next-line react/jsx-props-no-spreading
            ? <SignInPageLayoutWide {...props}>{props.children}</SignInPageLayoutWide>
            // eslint-disable-next-line react/jsx-props-no-spreading
            : <SignInPageLayoutNarrow {...props}>{props.children}</SignInPageLayoutNarrow>}
    </SafeAreaView>
);

SignInPageLayout.propTypes = propTypes;
SignInPageLayout.displayName = 'SignInPageLayout';

export default withWindowDimensions(SignInPageLayout);
