import React, {useRef} from 'react';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import {setLocaleAndNavigate} from '@userActions/App';
import type {ListItem} from '@src/components/SelectionList/types';
import CONST from '@src/CONST';

type LanguageEntry = ListItem & {
    value: ValueOf<typeof CONST.LOCALES>;
};

function LanguagePage() {
    const {translate, preferredLocale} = useLocalize();
    const isOptionSelected = useRef(false);

    const localesToLanguages = CONST.LANGUAGES.map((language) => ({
        value: language,
        text: translate(`languagePage.languages.${language}.label`),
        keyForList: language,
        isSelected: preferredLocale === language,
    }));

    const updateLanguage = (selectedLanguage: LanguageEntry) => {
        if (isOptionSelected.current) {
            return;
        }
        isOptionSelected.current = true;
        setLocaleAndNavigate(selectedLanguage.value);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={LanguagePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('languagePage.language')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <SelectionList
                sections={[{data: localesToLanguages}]}
                ListItem={RadioListItem}
                onSelectRow={updateLanguage}
                shouldSingleExecuteRowSelect
                initiallyFocusedOptionKey={localesToLanguages.find((locale) => locale.isSelected)?.keyForList}
            />
        </ScreenWrapper>
    );
}

LanguagePage.displayName = 'LanguagePage';

export default LanguagePage;
