import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

type FormHelpMessageRowWithRetryButtonProps = {
    /** The error message to display in the form help row. */
    message: string;

    /** Callback function invoked when the retry button is clicked. */
    onRetry: () => void | Promise<void>;

    /** Whether the retry button's size should be "small". If not, then the size is "medium". */
    isButtonSmall?: boolean;
};

function FormHelpMessageRowWithRetryButton({message, isButtonSmall = false, onRetry}: FormHelpMessageRowWithRetryButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    return (
        <View style={[styles.flexRow, styles.justifyContentBetween, styles.gap3]}>
            <FormHelpMessage
                message={message}
                style={[styles.mt0, styles.mb0, styles.flex1]}
            />
            <Button
                small={isButtonSmall}
                medium={!isButtonSmall}
                text={translate('domain.retry')}
                onPress={onRetry}
                isDisabled={isOffline}
            />
        </View>
    );
}

export default FormHelpMessageRowWithRetryButton;
