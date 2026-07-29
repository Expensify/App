import useNetwork from '@hooks/useNetwork';

import React from 'react';

import type {ButtonProps} from '.';

import Button from '.';

type ButtonDisabledWhenOfflineProps = ButtonProps & {
    disabledWhenOffline?: boolean;
};

function ButtonDisabledWhenOffline({disabledWhenOffline = true, ...props}: ButtonDisabledWhenOfflineProps) {
    const {isOffline} = useNetwork();
    return (
        <Button
            {...props}
            isDisabled={disabledWhenOffline && isOffline}
        />
    );
}
export default ButtonDisabledWhenOffline;
