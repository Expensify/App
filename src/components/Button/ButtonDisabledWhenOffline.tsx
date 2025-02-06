import React from 'react';
import useNetwork from '@hooks/useNetwork';
import Button from '.';
import type {ButtonProps} from '.';

type ButtonDisabledWhenOfflineProps = ButtonProps & {
    disabledWhenOffline?: boolean;
};

function ButtonDisabledWhenOffline({disabledWhenOffline = true, ...props}: ButtonDisabledWhenOfflineProps) {
    const {isOffline} = useNetwork();
    return (
        <Button
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isDisabled={disabledWhenOffline && isOffline}
        />
    );
}
export default ButtonDisabledWhenOffline;
