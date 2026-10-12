import React from 'react';

import type AddToWalletStatusTextProps from './types';

import BaseAddToWalletStatusText from './BaseAddToWalletStatusText';

function AddToWalletStatusText(props: AddToWalletStatusTextProps) {
    return (
        <BaseAddToWalletStatusText
            {...props}
            platform="Apple"
        />
    );
}

export default AddToWalletStatusText;
