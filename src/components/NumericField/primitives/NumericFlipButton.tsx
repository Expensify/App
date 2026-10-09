import {NumericFlipButton as NumericFlipButtonComponent} from '@components/NumericButtons';
import type {NumericFlipButtonProps} from '@components/NumericButtons';
import {useNumericFieldActions, useNumericFieldState} from '@components/NumericField/context';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

const canUseTouchScreen = canUseTouchScreenUtil();

/** Toggles the sign of the value. Rendered only when the root allows negative values and the device has a touchscreen. */
function NumericFlipButton(props: Omit<NumericFlipButtonProps, 'onPress'>) {
    const {allowNegative} = useNumericFieldState();
    const {toggleSign} = useNumericFieldActions();

    if (!allowNegative || !canUseTouchScreen) {
        return null;
    }

    return (
        <NumericFlipButtonComponent
            {...props}
            onPress={toggleSign}
        />
    );
}

export default NumericFlipButton;
