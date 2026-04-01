import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

type Shortcut = {
    displayName: string;
    descriptionKey: 'search' | 'newChat' | 'openShortcutDialog' | 'escape' | 'copy';
};

function DynamicKeyboardShortcutsPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.KEYBOARD_SHORTCUTS.path);

    const shortcuts = Object.values(CONST.KEYBOARD_SHORTCUTS)
        .map((shortcut) => {
            const platformAdjustedModifiers = KeyboardShortcut.getPlatformEquivalentForKeys(shortcut.modifiers);
            return {
                displayName: KeyboardShortcut.getDisplayName(shortcut.shortcutKey, platformAdjustedModifiers),
                descriptionKey: shortcut.descriptionKey,
            };
        })
        .filter((shortcut): shortcut is Shortcut => !!shortcut.descriptionKey);

    const renderShortcut = (shortcut: Shortcut) => (
        <MenuItem
            key={shortcut.displayName}
            title={shortcut.displayName}
            description={translate(`keyboardShortcutsPage.shortcuts.${shortcut.descriptionKey}`)}
            wrapperStyle={[styles.ph0, styles.cursorAuto]}
            interactive={false}
        />
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="KeyboardShortcutsPage"
        >
            <HeaderWithBackButton
                title={translate('keyboardShortcutsPage.title')}
                onBackButtonPress={() => Navigation.goBack(backPath)}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <View style={[styles.ph5, styles.pv3]}>
                    <Text style={[styles.mb3, styles.webViewStyles.baseFontStyle]}>{translate('keyboardShortcutsPage.subtitle')}</Text>
                    {shortcuts.map(renderShortcut)}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default DynamicKeyboardShortcutsPage;
