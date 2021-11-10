import React, {forwardRef} from 'react';
import {Keyboard} from 'react-native';
import BaseOptionsList from './BaseOptionsList';

export default forwardRef((props, ref) => (
    <BaseOptionsList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}

        // Both `keyboardDismissMode` & `onScrollBeginDrag` props are needed to ensure that virtual keyboard is
        // dismissed on all platforms.
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={() => Keyboard.dismiss()}
    />
));
