import type {ForwardedRef} from 'react';
import React from 'react';
import type {TextInput} from 'react-native';
import Composer from './implementation';
import type {ComposerProps} from './types';

function ComposerE2E(props: ComposerProps, ref: ForwardedRef<TextInput>) {
    return (
        <Composer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            // In the app we only focus when actually pressing the input, for the e2e tests calling .focus() must open the keyboard
            showSoftInputOnFocus
        />
    );
}

export default React.forwardRef(ComposerE2E);
