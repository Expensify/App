import FormHelpMessage from '@components/FormHelpMessage';
import {useNumberComposerState} from '@components/NumberComposer/context';
import type {NumberComposerErrorProps} from '@components/NumberComposer/types';

import useThemeStyles from '@hooks/useThemeStyles';

/**
 * Renders the root error as a sibling of the composed input, so the composition decides where the message sits. The
 * number-pad layouts position it differently: the portrait layout pins it to the bottom of the number view, while the
 * landscape layout lets it flow under the controls.
 */
function NumberComposerError({style}: NumberComposerErrorProps) {
    const styles = useThemeStyles();
    const {errorText} = useNumberComposerState();

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

export default NumberComposerError;
