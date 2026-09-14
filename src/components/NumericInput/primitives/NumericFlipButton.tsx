import {NumericFlipButton as NumericFlipButtonComponent} from '@components/NumericButtons';
import type {NumericFlipButtonProps} from '@components/NumericButtons';
import {useNumericInputActions, useNumericInputState} from '@components/NumericInput/context';

/** Toggles the sign of the canonical value. Rendered only when the root allows negative values. */
function NumericFlipButton(props: Omit<NumericFlipButtonProps, 'onPress'>) {
    const {allowNegative} = useNumericInputState();
    const {toggleSign} = useNumericInputActions();

    if (!allowNegative) {
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
