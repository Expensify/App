import React, {useRef} from 'react';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {updateTheme as updateThemeUserAction} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type ThemeEntry = ListItem & {
    value: ValueOf<typeof CONST.THEME>;
};

function ThemePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [preferredTheme] = useOnyx(ONYXKEYS.PREFERRED_THEME, {canBeMissing: true});
    const isOptionSelected = useRef(false);
    const {DEFAULT, FALLBACK, ...themes} = CONST.THEME;
    const localesToThemes = Object.values(themes).map((theme) => ({
        value: theme,
        text: translate(`themePage.themes.${theme}.label`),
        keyForList: theme,
        isSelected: (preferredTheme ?? CONST.THEME.DEFAULT) === theme,
    }));

    const updateTheme = (selectedTheme: ThemeEntry) => {
        if (isOptionSelected.current) {
            return;
        }
        isOptionSelected.current = true;
        updateThemeUserAction(selectedTheme.value);
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
            <SelectionList
                data={localesToThemes}
                ListItem={RadioListItem}
                onSelectRow={updateTheme}
                shouldSingleExecuteRowSelect
                initiallyFocusedItemKey={localesToThemes.find((theme) => theme.isSelected)?.keyForList}
            />
        </ScreenWrapper>
    );
}

export default ThemePage;
