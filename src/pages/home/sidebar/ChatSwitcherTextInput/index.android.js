/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {View} from 'react-native';
import TextInputWithFocusStyles from '../../../../components/TextInputWithFocusStyles';
import styles from '../../../../styles/styles';

const ChatSwitcherTextInput = React.forwardRef((props, ref) => (
    <View style={styles.chatSwitcherTextInputContainer}>
        <TextInputWithFocusStyles
            ref={ref}
            {...props}
            style={[styles.chatSwitcherTextInput, styles.flex1]}
        />
    </View>
));

export default ChatSwitcherTextInput;
