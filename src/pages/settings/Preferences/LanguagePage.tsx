import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import {setLocale} from '@userActions/App';

import {LOCALE_TO_LANGUAGE_STRING, SORTED_LOCALES} from '@src/CONST/LOCALES';
import type Locale from '@src/types/onyx/Locale';

import React, {useMemo, useState} from 'react';

type LanguageEntry = ListItem & {
    value: Locale;
};

function LanguagePage() {
    const {translate, preferredLocale} = useLocalize();

    const [draftLocale, setDraftLocale] = useState<Locale>();
    const selectedLocale = draftLocale ?? preferredLocale;

    const locales = useMemo(() => {
        const sortedLocales = preferredLocale ? [preferredLocale, ...SORTED_LOCALES.filter((locale) => locale !== preferredLocale)] : SORTED_LOCALES;

        return sortedLocales.map((locale) => ({
            value: locale,
            text: LOCALE_TO_LANGUAGE_STRING[locale],
            accessibilityLabel: LOCALE_TO_LANGUAGE_STRING[locale],
            keyForList: locale,
            isSelected: selectedLocale === locale,
            lang: locale,
        }));
    }, [preferredLocale, selectedLocale]);

    const saveAndGoBack = () => {
        if (selectedLocale && selectedLocale !== preferredLocale) {
            setLocale(selectedLocale, preferredLocale);
        }
        Navigation.goBack();
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: saveAndGoBack,
        isDisabled: selectedLocale === preferredLocale,
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            testID="LanguagePage"
        >
            <HeaderWithBackButton
                title={translate('languagePage.language')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FullPageOfflineBlockingView>
                <SelectionList
                    data={locales}
                    ListItem={SingleSelectListItem}
                    onSelectRow={(item: LanguageEntry) => setDraftLocale(item.value)}
                    confirmButtonOptions={confirmButtonOptions}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={preferredLocale}
                    addBottomSafeAreaPadding
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default LanguagePage;
