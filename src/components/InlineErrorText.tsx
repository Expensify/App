import React from 'react';
import {TextStyle} from 'react-native';
import styles from '@styles/styles';
import Text from './Text';

type InlineErrorTextProps = {
    children: React.ReactNode;
    styles: TextStyle[];
};
function InlineErrorText(props: InlineErrorTextProps) {
    if (!props.children) {
        return null;
    }

    return <Text style={[...props.styles, styles.formError, styles.mt1]}>{props.children}</Text>;
}

InlineErrorText.displayName = 'InlineErrorText';
export default InlineErrorText;
