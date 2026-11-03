import {AmountSignFlipButton} from '@components/AmountActionButtons';
import type {AmountSignFlipButtonProps} from '@components/AmountActionButtons';
import {useAmountFormFieldActions, useAmountFormFieldState} from '@components/AmountFormField/context';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

const canUseTouchScreen = canUseTouchScreenUtil();

/** Toggles the sign of the value. Rendered only when the root allows negative values and the device has a touchscreen. */
function AmountFormFieldSignFlipButton(props: Omit<AmountSignFlipButtonProps, 'onPress'>) {
    const {allowNegative} = useAmountFormFieldState();
    const {toggleSign} = useAmountFormFieldActions();

    if (!allowNegative || !canUseTouchScreen) {
        return null;
    }

    return (
        <AmountSignFlipButton
            {...props}
            onPress={toggleSign}
        />
    );
}

export default AmountFormFieldSignFlipButton;
