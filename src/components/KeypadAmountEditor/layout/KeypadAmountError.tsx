import FormHelpMessage from '@components/FormHelpMessage';
import {useKeypadAmountEditorState} from '@components/KeypadAmountEditor/context';

import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

type KeypadAmountErrorProps = {
    /** Style applied to the message container, appended to the defaults. */
    style?: StyleProp<ViewStyle>;
};

/** Renders the root error, placed by the layout. */
function KeypadAmountError({style}: KeypadAmountErrorProps) {
    const styles = useThemeStyles();
    const {errorText} = useKeypadAmountEditorState();

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

export default KeypadAmountError;
