import FormHelpMessage from '@components/FormHelpMessage';
import {useNumericInputState} from '@components/NumericInput/context';
import type {NumericErrorProps} from '@components/NumericInput/types';

import useThemeStyles from '@hooks/useThemeStyles';

/**
 * Renders the root error as a sibling of the composed input, so the composition decides where the message sits. The
 * number-pad layouts position it differently: the portrait layout pins it to the bottom of the number view, while the
 * landscape layout lets it flow under the controls.
 */
function NumericError({style}: NumericErrorProps) {
    const styles = useThemeStyles();
    const {errorText} = useNumericInputState();

    if (!errorText) {
        return null;
    }

    return (
        <FormHelpMessage
            style={[styles.ph5, styles.w100, style]}
            isError
            message={errorText}
        />
    );
}

export default NumericError;
