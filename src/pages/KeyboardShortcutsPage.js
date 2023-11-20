import React from 'react';
import {ScrollView, View} from 'react-native';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

function KeyboardShortcutsPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const shortcuts = _.chain(CONST.KEYBOARD_SHORTCUTS)
        .filter((shortcut) => !_.isEmpty(shortcut.descriptionKey))
        .map((shortcut) => {
            const platformAdjustedModifiers = KeyboardShortcut.getPlatformEquivalentForKeys(shortcut.modifiers);
            return {
                displayName: KeyboardShortcut.getDisplayName(shortcut.shortcutKey, platformAdjustedModifiers),
                descriptionKey: shortcut.descriptionKey,
            };
        })
        .value();

    /**
     * Render the information of a single shortcut
     * @param {Object} shortcut
     * @param {String} shortcut.displayName
     * @param {String} shortcut.descriptionKey
     * @returns {React.Component}
     */
    const renderShortcut = (shortcut) => (
        <MenuItem
            key={shortcut.displayName}
            title={shortcut.displayName}
            description={translate(`keyboardShortcutsPage.shortcuts.${shortcut.descriptionKey}`)}
            wrapperStyle={styles.ph0}
            interactive={false}
        />
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={KeyboardShortcutsPage.displayName}
        >
            <HeaderWithBackButton title={translate('keyboardShortcutsPage.title')} />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <View style={[styles.ph5, styles.pv3]}>
                    <Text style={[styles.mb3, styles.baseFontStyle]}>{translate('keyboardShortcutsPage.subtitle')}</Text>
                    {_.map(shortcuts, renderShortcut)}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

KeyboardShortcutsPage.displayName = 'KeyboardShortcutsPage';

export default KeyboardShortcutsPage;
