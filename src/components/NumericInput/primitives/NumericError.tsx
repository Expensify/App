import FormHelpMessage from '@components/FormHelpMessage';
import {useNumericInputState} from '@components/NumericInput/context';
import type {NumericErrorProps} from '@components/NumericInput/types';

import useThemeStyles from '@hooks/useThemeStyles';

/** Renders the root error wherever the composition places this primitive. */
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
