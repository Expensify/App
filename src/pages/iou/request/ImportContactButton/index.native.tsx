import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import goToSettings from '@libs/goToSettings';

type ImportContactButtonProps = {
    showImportContacts?: boolean;
    inputHelperText?: string;
    isInSearch?: boolean;
};

function ImportContactButton({showImportContacts, inputHelperText, isInSearch = false}: ImportContactButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return showImportContacts && inputHelperText ? (
        <View style={[styles.ph5, styles.pb5, styles.flexRow]}>
            <Text style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>
                {isInSearch ? `${translate('common.noResultsFound')}. ` : null}
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

export default ImportContactButton;
