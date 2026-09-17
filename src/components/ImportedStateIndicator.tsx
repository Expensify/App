import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearOnyxAndResetApp} from '@libs/actions/App';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

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
                variant={CONST.BUTTON_VARIANT.DANGER}
                size={CONST.BUTTON_SIZE.SMALL}
                removeBorderRadius={CONST.BUTTON_REMOVE_BORDER_RADIUS.ALL}
                onPress={() => clearOnyxAndResetApp(true)}
            >
                <Button.Text style={[styles.fontWeightNormal]}>{translate('initialSettingsPage.troubleshoot.usingImportedState')}</Button.Text>
            </Button>
        </View>
    );
}

export default ImportedStateIndicator;
