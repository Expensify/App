import React, {useMemo, useRef} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import type {ListItem} from '@components/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import {setLocale} from '@userActions/App';
import {LOCALE_TO_LANGUAGE_STRING, SORTED_LOCALES} from '@src/CONST/LOCALES';
import type Locale from '@src/types/onyx/Locale';

type LanguageEntry = ListItem & {
    value: Locale;
};

function LanguagePage() {
    const {translate, preferredLocale} = useLocalize();
    const isOptionSelected = useRef(false);

    const locales = useMemo(() => {
        return SORTED_LOCALES.map((locale) => ({
            value: locale,
            text: LOCALE_TO_LANGUAGE_STRING[locale],
            keyForList: locale,
            isSelected: preferredLocale === locale,
        }));
    }, [preferredLocale]);

    const updateLanguage = (selectedLanguage: LanguageEntry) => {
        if (isOptionSelected.current) {
            return;
        }
        isOptionSelected.current = true;

        setLocale(selectedLanguage.value, preferredLocale);
        Navigation.goBack();
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
            <FullPageOfflineBlockingView>
                <SelectionList
                    sections={[{data: locales}]}
                    ListItem={RadioListItem}
                    onSelectRow={updateLanguage}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedOptionKey={locales.find((locale) => locale.isSelected)?.keyForList}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

LanguagePage.displayName = 'LanguagePage';

export default LanguagePage;
