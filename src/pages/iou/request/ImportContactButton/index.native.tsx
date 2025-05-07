import React, {useCallback} from 'react';
import {Linking, View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import saveLastRoute from '@libs/saveLastRoute';
import useLocalize from '@hooks/useLocalize';

type ImportContactButtonProps = {
    showImportContacts?: boolean;
    inputHelperText?: string;
};

function ImportContactButton({showImportContacts, inputHelperText}: ImportContactButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const goToSettings = useCallback(() => {
        Linking.openSettings();
        // In the case of ios, the App reloads when we update contact permission from settings
        // we are saving last route so we can navigate to it after app reload
        saveLastRoute();
    }, []);

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
