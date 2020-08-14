import React from 'react';
import {TextInput} from 'react-native';

/**
 * On native layers we like to have the Text Input not focused so the user can read new chats without they keyboard in
 * the way of the view
 */
// eslint-disable-next-line react/jsx-props-no-spreading
const TextInputFocusable = props => (<TextInput {...props} />);
export default TextInputFocusable;
