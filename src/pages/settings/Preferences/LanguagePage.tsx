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

    // The draft holds the user's in-page selection. Until they pick a row it stays undefined and we fall back to the
    // persisted locale, so the change of context (persist + navigate) only happens when the user taps Save.
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
        // Nothing to save while the selection still matches the persisted locale.
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
            <FullPageOfflineBlockingView addBottomSafeAreaPadding>
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
