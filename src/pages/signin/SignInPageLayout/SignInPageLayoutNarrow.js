import React from 'react';
import {
    Image, ScrollView, Text, View
} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import logo from '../../../../assets/images/expensify-logo-round.png';

const propTypes = {
    // The children to show inside the layout
    children: PropTypes.node.isRequired,
};

const SignInPageLayoutNarrow = ({children}) => (
    <ScrollView>
        <View>
            <View style={[styles.signInPageInnerNative]}>
                <View style={[styles.signInPageLogoNative]}>
                    <Image
                        resizeMode="contain"
                        style={[styles.signinLogo]}
                        source={logo}
                    />
                </View>

                <View style={[styles.mb6, styles.alignItemsCenter]}>
                    <Text style={[styles.h1]}>
                        Expensify.cash
                    </Text>
                </View>

                {children}
            </View>
        </View>
    </ScrollView>
);

SignInPageLayoutNarrow.propTypes = propTypes;
SignInPageLayoutNarrow.displayName = 'SignInPageLayoutNarrow';


export default SignInPageLayoutNarrow;
