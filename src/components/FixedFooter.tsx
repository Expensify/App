import React, {ReactNode} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import styles from '../styles/styles';

type FixedFooterProps = {
    /** Children to wrap in FixedFooter. */
    children: ReactNode;

    /** Styles to be assigned to Container */
    style: Array<StyleProp<ViewStyle>>;
};

function FixedFooter({style = [], children}: FixedFooterProps) {
    return <View style={[styles.ph5, styles.pb5, styles.flexShrink0, ...style]}>{children}</View>;
}

FixedFooter.displayName = 'FixedFooter';

export default FixedFooter;
