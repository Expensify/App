import type {ButtonProps} from '@components/ButtonComposed';
import Button from '@components/ButtonComposed';

import useNetwork from '@hooks/useNetwork';

import React from 'react';

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
