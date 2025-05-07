import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import goToSettings from '../goToSettings';

type ImportContactButtonProps = {
    showImportContacts?: boolean;
    inputHelperText?: string;
};

function ImportContactButton({showImportContacts, inputHelperText}: ImportContactButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return showImportContacts && inputHelperText ? (
        <View style={[styles.ph5, styles.pb5, styles.flexRow]}>
            <Text style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>
                {`${translate('common.noResultsFound')}. `}
                <Text
                    style={[styles.textLabel, styles.minHeight5, styles.link]}
                    onPress={goToSettings}
                >
                    {translate('contact.importContactsTitle')}
                </Text>{' '}
                {translate('contact.importContactsExplanation')}
            </Text>
        </View>
    ) : null;
}

ImportContactButton.displayName = 'ImportContactButton';

export default ImportContactButton;
