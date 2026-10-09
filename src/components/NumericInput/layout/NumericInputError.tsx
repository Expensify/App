import FormHelpMessage from '@components/FormHelpMessage';
import {useNumericInputState} from '@components/NumericInput/context';

import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

type NumericInputErrorProps = {
    /** Style applied to the message container, appended to the defaults. */
    style?: StyleProp<ViewStyle>;
};

/** Renders the root error, placed by the layout. */
function NumericInputError({style}: NumericInputErrorProps) {
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

export default NumericInputError;
