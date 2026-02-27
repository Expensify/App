import React from 'react';
import Composer from './implementation';
import type {ComposerProps} from './types';

function ComposerE2E(props: ComposerProps) {
    return (
        <Composer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            // In the app we only focus when actually pressing the input, for the e2e tests calling .focus() must open the keyboard
            showSoftInputOnFocus
        />
    );
}

export default ComposerE2E;
