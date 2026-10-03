import Text from '@components/Text';

import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import goToSettings from '@libs/goToSettings';

import React from 'react';
import {View} from 'react-native';

type ImportContactButtonProps = {
    showImportContacts?: boolean;
    inputHelperText?: string;
    isInSearch?: boolean;

    /** Called when the link is pressed. Opens the app's settings so the contact permission can be granted by default */
    onPress?: () => void;
};

function ImportContactButton({showImportContacts, inputHelperText, isInSearch = false, onPress = goToSettings}: ImportContactButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const noResultsFoundText = translate('common.noResultsFound');

    const shouldAnnounce = !!isInSearch && !!showImportContacts && !!inputHelperText;
    useAccessibilityAnnouncement(noResultsFoundText, shouldAnnounce, {shouldAnnounceOnNative: true});

    return showImportContacts && inputHelperText ? (
        <View style={[styles.ph5, styles.pb5, styles.flexRow]}>
            <Text style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>
                {isInSearch ? `${noResultsFoundText}. ` : null}
                <Text
                    style={[styles.textLabel, styles.minHeight5, styles.link]}
                    onPress={onPress}
                >
                    {translate('contact.importContactsTitle')}
                </Text>{' '}
                {translate('contact.importContactsExplanation')}
            </Text>
        </View>
    ) : null;
}

export default ImportContactButton;
