import Button from '@components/ButtonComposed';
import FormHelpMessage from '@components/FormHelpMessage';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type FormHelpMessageRowButtonSize = typeof CONST.BUTTON_SIZE.SMALL | typeof CONST.BUTTON_SIZE.MEDIUM;
type FormHelpMessageRowButtonVariant = typeof CONST.BUTTON_VARIANT.DANGER;

type FormHelpMessageRowWithRetryButtonProps = {
    /** The error message to display in the form help row. */
    message: string;

    /** Callback function invoked when the retry button is clicked. */
    onRetry: () => void | Promise<void>;

    /** The retry button's size. */
    size?: FormHelpMessageRowButtonSize;

    /** Visual variant of the retry button. */
    variant?: FormHelpMessageRowButtonVariant;

    /** Whether the retry button should stay next to the message instead of being pushed to the far edge. */
    shouldAlignButtonToMessage?: boolean;
};

function FormHelpMessageRowWithRetryButton({message, size = CONST.BUTTON_SIZE.MEDIUM, onRetry, variant, shouldAlignButtonToMessage = false}: FormHelpMessageRowWithRetryButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, shouldAlignButtonToMessage ? styles.justifyContentStart : styles.justifyContentBetween]}>
            <FormHelpMessage
                message={message}
                style={[styles.mt0, styles.mb0, shouldAlignButtonToMessage ? styles.flexShrink1 : styles.flex1]}
            />
            <Button
                size={size}
                variant={variant}
                onPress={onRetry}
                isDisabled={isOffline}
            >
                <Button.Text>{translate('domain.retry')}</Button.Text>
            </Button>
        </View>
    );
}

export default FormHelpMessageRowWithRetryButton;
