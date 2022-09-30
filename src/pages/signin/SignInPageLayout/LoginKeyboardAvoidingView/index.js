import React from 'react';
import {KeyboardAvoidingView} from 'react-native';
import {withSafeAreaInsets} from 'react-native-safe-area-context';
import compose from '../../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import styles from '../../../../styles/styles';
import variables from '../../../../styles/variables';
import * as StyleUtils from '../../../../styles/StyleUtils';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const LoginKeyboardAvoidingView = (props) => {
    // These styles are here for mobile web only. For more context see https://github.com/Expensify/App/pull/6203
    const style = [
        props.isSmallScreenWidth ? styles.signInPageNarrowContentMargin : {},
        !props.isMediumScreenWidth || (props.isMediumScreenWidth && props.windowHeight < variables.minHeightToShowGraphics) ? styles.signInPageWideLeftContentMargin : {},
        styles.mb3,
        StyleUtils.getModalPaddingStyles({
            shouldAddBottomSafeAreaPadding: true,
            modalContainerStylePaddingBottom: 20,
            safeAreaPaddingBottom: props.insets.bottom,
        }),
    ];
    return (
        <KeyboardAvoidingView
            behavior="position"
            style={style}
        >
            {props.children}
        </KeyboardAvoidingView>
    );
};

LoginKeyboardAvoidingView.propTypes = propTypes;
LoginKeyboardAvoidingView.displayName = 'LoginKeyboardAvoidingView';

export default compose(
    withWindowDimensions,
    withSafeAreaInsets,
)(LoginKeyboardAvoidingView);
