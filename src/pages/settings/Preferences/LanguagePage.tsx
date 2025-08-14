import React, {useMemo, useRef} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import {setLocaleAndNavigate} from '@userActions/App';
import type {ListItem} from '@src/components/SelectionList/types';
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
