import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import Switch from '@components/Switch';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import {getBaseTheme, getContrastTheme, isHighContrastTheme} from '@styles/theme/utils';

import {updateTheme as updateThemeUserAction} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';

type ThemeEntry = ListItem & {
    value: ValueOf<typeof CONST.THEME>;
};

const BASE_THEMES = [CONST.THEME.LIGHT, CONST.THEME.DARK, CONST.THEME.SYSTEM] as const;

function ThemePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [preferredTheme] = useOnyx(ONYXKEYS.PREFERRED_THEME);

    const currentTheme = preferredTheme ?? CONST.THEME.DEFAULT;

    // Keep the selection in local draft state so picking a theme (or toggling high contrast) no longer persists and
    // closes the page on input. The change is only applied when the user taps Save (WCAG 3.2.2 On Input).
    const [selectedBaseTheme, setSelectedBaseTheme] = useState<ValueOf<typeof CONST.THEME>>(() => getBaseTheme(currentTheme));
    const [isHighContrast, setIsHighContrast] = useState(() => isHighContrastTheme(currentTheme));

    const localesToThemes = BASE_THEMES.map((theme) => ({
        value: theme,
        text: translate(`themePage.themes.${theme}.label`),
        keyForList: theme,
        isSelected: selectedBaseTheme === theme,
    }));

    const updateTheme = (selectedTheme: ThemeEntry) => {
        setSelectedBaseTheme(selectedTheme.value);
    };

    const onToggleHighContrast = (enabled: boolean) => {
        setIsHighContrast(enabled);
    };

    const saveTheme = useCallback(() => {
        const themeToStore = isHighContrast ? getContrastTheme(selectedBaseTheme) : selectedBaseTheme;
        updateThemeUserAction(themeToStore);
    }, [isHighContrast, selectedBaseTheme]);

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: true,
            text: translate('common.save'),
            onConfirm: saveTheme,
        }),
        [translate, saveTheme],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="ThemePage"
        >
            <HeaderWithBackButton
                title={translate('themePage.theme')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <Text style={[styles.mh5, styles.mv4]}>{translate('themePage.chooseThemeBelowOrSync')}</Text>
            <View style={styles.flex1}>
                <SelectionList
                    data={localesToThemes}
                    ListItem={SingleSelectListItem}
                    onSelectRow={updateTheme}
                    shouldSingleExecuteRowSelect
                    confirmButtonOptions={confirmButtonOptions}
                    initiallyFocusedItemKey={localesToThemes.find((theme) => theme.isSelected)?.keyForList}
                    listFooterContent={
                        <>
                            <View style={[styles.mh5, styles.borderTop]} />
                            <View style={[styles.flexRow, styles.mh5, styles.mv4, styles.justifyContentBetween, styles.alignItemsCenter]}>
                                <View style={styles.flex4}>
                                    <Text>{translate('themePage.highContrastMode')}</Text>
                                </View>
                                <View style={[styles.flex1, styles.alignItemsEnd]}>
                                    <Switch
                                        accessibilityLabel={translate('themePage.highContrastMode')}
                                        isOn={isHighContrast}
                                        onToggle={onToggleHighContrast}
                                    />
                                </View>
                            </View>
                        </>
                    }
                />
            </View>
        </ScreenWrapper>
    );
}

export default ThemePage;
