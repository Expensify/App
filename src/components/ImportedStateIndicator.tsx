import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearOnyxAndResetApp} from '@libs/actions/App';
import ONYXKEYS from '@src/ONYXKEYS';
import Button from './Button';

function ImportedStateIndicator() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isUsingImportedState] = useOnyx(ONYXKEYS.IS_USING_IMPORTED_STATE);

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
                onPress={() => clearOnyxAndResetApp(true)}
                textStyles={[styles.fontWeightNormal]}
            />
        </View>
    );
}

export default ImportedStateIndicator;
