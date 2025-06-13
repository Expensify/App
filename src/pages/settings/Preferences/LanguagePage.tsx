import React, {useRef} from 'react';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import Navigation from '@libs/Navigation/Navigation';
import {setLocaleAndNavigate} from '@userActions/App';
import type {ListItem} from '@src/components/SelectionList/types';
import CONST from '@src/CONST';
import type {SupportedLanguage} from '@src/CONST/LOCALES';
import {LANGUAGES, UPCOMING_LANGUAGES} from '@src/CONST/LOCALES';

type LanguageEntry = ListItem & {
    value: SupportedLanguage;
};

function LanguagePage() {
    const {translate, preferredLocale} = useLocalize();
    const isOptionSelected = useRef(false);

    const {isBetaEnabled} = usePermissions();
    const localesToLanguages: LanguageEntry[] = LANGUAGES.map((language: SupportedLanguage) => ({
        value: language,
        text: translate(`languagePage.languages.${language}.label`),
        keyForList: language,
        isSelected: preferredLocale === language,
        shouldShowRightIcon: true,
    }));

    if (isBetaEnabled(CONST.BETAS.STATIC_AI_TRANSLATIONS)) {
        localesToLanguages.push(
            ...UPCOMING_LANGUAGES.map((language: SupportedLanguage) => ({
                value: language,
                text: translate(`languagePage.languages.${language}.label`),
                keyForList: language,
                isSelected: preferredLocale === language,
                shouldShowRightIcon: true,
            })),
        );
    }

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
                ListItem={SingleSelectListItem}
                onSelectRow={updateLanguage}
                shouldSingleExecuteRowSelect
                initiallyFocusedOptionKey={localesToLanguages.find((locale) => locale.isSelected)?.keyForList}
            />
        </ScreenWrapper>
    );
}

LanguagePage.displayName = 'LanguagePage';

export default LanguagePage;
