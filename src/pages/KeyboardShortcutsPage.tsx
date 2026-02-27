import type {RouteProp} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type Shortcut = {
    displayName: string;
    descriptionKey: 'search' | 'newChat' | 'openShortcutDialog' | 'escape' | 'copy';
};

type KeyboardShortcutsPageProps = {
    route: RouteProp<SettingsNavigatorParamList, typeof SCREENS.KEYBOARD_SHORTCUTS>;
};

function KeyboardShortcutsPage({route}: KeyboardShortcutsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const backTo = route.params.backTo;
    const shortcuts = Object.values(CONST.KEYBOARD_SHORTCUTS)
        .map((shortcut) => {
            const platformAdjustedModifiers = KeyboardShortcut.getPlatformEquivalentForKeys(shortcut.modifiers);
            return {
                displayName: KeyboardShortcut.getDisplayName(shortcut.shortcutKey, platformAdjustedModifiers),
                descriptionKey: shortcut.descriptionKey,
            };
        })
        .filter((shortcut): shortcut is Shortcut => !!shortcut.descriptionKey);
    /**
     * Render the information of a single shortcut
     * @param shortcut - The shortcut to render
     */
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
                onBackButtonPress={() => Navigation.goBack(backTo)}
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

export default KeyboardShortcutsPage;
