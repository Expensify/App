import React from 'react';
import {
    ScrollView, Text, View,
} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import Icon, {BRAND_ASSETS} from '../../../components/Icon';

const propTypes = {
    // The children to show inside the layout
    children: PropTypes.node.isRequired,
};

const SignInPageLayoutNarrow = ({children}) => (
    <ScrollView>
        <View>
            <View style={[styles.signInPageInnerNative]}>
                <View style={[styles.signInPageLogoNative]}>
                    <Icon
                        icon={BRAND_ASSETS.ExpensifyCashLogo}
                        width={variables.componentSizeLarge}
                        height={variables.componentSizeLarge}
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
