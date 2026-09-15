import {NumericFlipButton as NumericFlipButtonComponent} from '@components/NumericButtons';
import type {NumericFlipButtonProps} from '@components/NumericButtons';
import {useNumericFieldActions, useNumericFieldState} from '@components/NumericField/context';

/** Toggles the sign of the value. Rendered only when the root allows negative values. */
function NumericFlipButton(props: Omit<NumericFlipButtonProps, 'onPress'>) {
    const {allowNegative} = useNumericFieldState();
    const {toggleSign} = useNumericFieldActions();

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
