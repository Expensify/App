import React, {useRef} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {updateThemeInPlace, updateTheme as updateThemeUserAction} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type ThemeEntry = ListItem & {
    value: ValueOf<typeof CONST.THEME>;
};

const CONTRAST_MAP: Record<string, string> = {
    [CONST.THEME.LIGHT]: CONST.THEME.LIGHT_CONTRAST,
    [CONST.THEME.DARK]: CONST.THEME.DARK_CONTRAST,
    [CONST.THEME.SYSTEM]: CONST.THEME.SYSTEM_CONTRAST,
    [CONST.THEME.LIGHT_CONTRAST]: CONST.THEME.LIGHT,
    [CONST.THEME.DARK_CONTRAST]: CONST.THEME.DARK,
    [CONST.THEME.SYSTEM_CONTRAST]: CONST.THEME.SYSTEM,
};

const HIGH_CONTRAST_THEMES = new Set<string>([CONST.THEME.LIGHT_CONTRAST, CONST.THEME.DARK_CONTRAST, CONST.THEME.SYSTEM_CONTRAST]);

const BASE_THEME_MAP: Record<string, string> = {
    [CONST.THEME.LIGHT]: CONST.THEME.LIGHT,
    [CONST.THEME.DARK]: CONST.THEME.DARK,
    [CONST.THEME.SYSTEM]: CONST.THEME.SYSTEM,
    [CONST.THEME.LIGHT_CONTRAST]: CONST.THEME.LIGHT,
    [CONST.THEME.DARK_CONTRAST]: CONST.THEME.DARK,
    [CONST.THEME.SYSTEM_CONTRAST]: CONST.THEME.SYSTEM,
};

const BASE_THEMES = [CONST.THEME.LIGHT, CONST.THEME.DARK, CONST.THEME.SYSTEM] as const;

function ThemePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [preferredTheme] = useOnyx(ONYXKEYS.PREFERRED_THEME);
    const isOptionSelected = useRef(false);

    const currentTheme = preferredTheme ?? CONST.THEME.DEFAULT;
    const isHighContrast = HIGH_CONTRAST_THEMES.has(currentTheme);
    const currentBaseTheme = BASE_THEME_MAP[currentTheme] ?? CONST.THEME.SYSTEM;

    const localesToThemes = BASE_THEMES.map((theme) => ({
        value: theme,
        text: translate(`themePage.themes.${theme}.label`),
        keyForList: theme,
        isSelected: currentBaseTheme === theme,
    }));

    const updateTheme = (selectedTheme: ThemeEntry) => {
        if (isOptionSelected.current) {
            return;
        }
        isOptionSelected.current = true;
        const themeToStore = isHighContrast ? (CONTRAST_MAP[selectedTheme.value] ?? selectedTheme.value) : selectedTheme.value;
        updateThemeUserAction(themeToStore as ValueOf<typeof CONST.THEME>);
    };

    const onToggleHighContrast = (enabled: boolean) => {
        const newTheme = enabled ? (CONTRAST_MAP[currentBaseTheme] ?? currentTheme) : currentBaseTheme;
        updateThemeInPlace(newTheme as ValueOf<typeof CONST.THEME>);
    };

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
            <View>
                <SelectionList
                    data={localesToThemes}
                    ListItem={RadioListItem}
                    onSelectRow={updateTheme}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={localesToThemes.find((theme) => theme.isSelected)?.keyForList}
                />
            </View>
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
        </ScreenWrapper>
    );
}

export default ThemePage;
