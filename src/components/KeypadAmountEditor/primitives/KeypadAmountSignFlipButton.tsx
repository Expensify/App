import {AmountSignFlipButton} from '@components/AmountActionButtons';
import {useKeypadAmountEditorActions, useKeypadAmountEditorState} from '@components/KeypadAmountEditor/context';
import type {KeypadAmountSignFlipButtonProps} from '@components/KeypadAmountEditor/types';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

const canUseTouchScreen = canUseTouchScreenUtil();

/** Toggles the sign of the canonical value. Rendered only when the root allows negative values and the device has a touchscreen. */
function KeypadAmountSignFlipButton(props: KeypadAmountSignFlipButtonProps) {
    const {allowNegative} = useKeypadAmountEditorState();
    const {toggleSign} = useKeypadAmountEditorActions();

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

export default KeypadAmountSignFlipButton;
