import React from "react";
import BaseButtonWithDropdownMenu from './BaseButtonWithDropdownMenu';
import type {BaseButtonWithDropdownMenuProps, PaymentType} from './types';

function PaymentButtonWithDropdownMenu({...props}: BaseButtonWithDropdownMenuProps<PaymentType>) {
    return (
        <BaseButtonWithDropdownMenu<PaymentType>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

PaymentButtonWithDropdownMenu.displayName = 'PaymentButtonWithDropdownMenu';

export default React.memo(PaymentButtonWithDropdownMenu);
