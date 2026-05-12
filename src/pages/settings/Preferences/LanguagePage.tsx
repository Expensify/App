import React, {useMemo, useRef} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import {setLocale} from '@userActions/App';
import CONST from '@src/CONST';
import {LOCALE_TO_LANGUAGE_STRING, SORTED_LOCALES} from '@src/CONST/LOCALES';
import type Locale from '@src/types/onyx/Locale';

type LanguageEntry = ListItem & {
    value: Locale;
};

function LanguagePage() {
    const {translate, preferredLocale} = useLocalize();
    const isOptionSelected = useRef(false);

    const locales = useMemo(() => {
        const sortedLocales = preferredLocale ? [preferredLocale, ...SORTED_LOCALES.filter((locale) => locale !== preferredLocale)] : SORTED_LOCALES;

        return sortedLocales.map((locale) => ({
            value: locale,
            text: LOCALE_TO_LANGUAGE_STRING[locale],
            accessibilityLabel: LOCALE_TO_LANGUAGE_STRING[locale],
            keyForList: locale,
            isSelected: preferredLocale === locale,
            lang: locale,
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
        <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.AGENT]}>
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
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
                        onSelectRow={updateLanguage}
                        shouldSingleExecuteRowSelect
                        initiallyFocusedItemKey={locales.find((locale) => locale.isSelected)?.keyForList}
                    />
                </FullPageOfflineBlockingView>
            </ScreenWrapper>
        </DelegateNoAccessWrapper>
    );
}

export default LanguagePage;
