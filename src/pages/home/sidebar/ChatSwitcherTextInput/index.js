/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import TextInputWithFocusStyles from '../../../../components/TextInputWithFocusStyles';

const ChatSwitcherTextInput = React.forwardRef((props, ref) => (
    <TextInputWithFocusStyles ref={ref} {...props} />
));

export default ChatSwitcherTextInput;
