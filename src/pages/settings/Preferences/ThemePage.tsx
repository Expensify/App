import React, {useRef} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
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

type ThemeEntry = ListItem & {
    value: ValueOf<typeof CONST.THEME>;
};

const BASE_THEMES = [CONST.THEME.LIGHT, CONST.THEME.DARK, CONST.THEME.SYSTEM] as const;

function ThemePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [preferredTheme] = useOnyx(ONYXKEYS.PREFERRED_THEME);
    const isOptionSelected = useRef(false);

    const currentTheme = preferredTheme ?? CONST.THEME.DEFAULT;
    const isHighContrast = isHighContrastTheme(currentTheme);
    const currentBaseTheme = getBaseTheme(currentTheme);

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
        const themeToStore = isHighContrast ? getContrastTheme(selectedTheme.value) : selectedTheme.value;
        updateThemeUserAction(themeToStore);
    };

    const onToggleHighContrast = (enabled: boolean) => {
        const newTheme = enabled ? getContrastTheme(currentBaseTheme) : currentBaseTheme;
        updateThemeUserAction(newTheme, false);
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
            <View style={styles.flex1}>
                <SelectionList
                    data={localesToThemes}
                    ListItem={SingleSelectListItem}
                    onSelectRow={updateTheme}
                    shouldSingleExecuteRowSelect
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
