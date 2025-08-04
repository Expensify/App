import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearOnyxAndResetApp} from '@libs/actions/App';
import ONYXKEYS from '@src/ONYXKEYS';
import Button from './Button';

function ImportedStateIndicator() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isUsingImportedState] = useOnyx(ONYXKEYS.IS_USING_IMPORTED_STATE, {canBeMissing: true});
    const [preservedUserSession] = useOnyx(ONYXKEYS.PRESERVED_USER_SESSION, {canBeMissing: true});

    if (!isUsingImportedState) {
        return null;
    }

    return (
        <View style={[styles.buttonDanger]}>
            <Button
                danger
                small
                shouldRemoveLeftBorderRadius
                shouldRemoveRightBorderRadius
                text={translate('initialSettingsPage.troubleshoot.usingImportedState')}
                onPress={() => clearOnyxAndResetApp(preservedUserSession, true)}
                textStyles={[styles.fontWeightNormal]}
            />
        </View>
    );
}

export default ImportedStateIndicator;
