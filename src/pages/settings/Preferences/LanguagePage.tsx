import React, {useRef} from 'react';
import type {ValueOf} from 'type-fest';
import Badge from '@components/Badge';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {Star} from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
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
    const {canUseStaticAiTranslations} = usePermissions();

    const localesToLanguages: LanguageEntry[] = CONST.LANGUAGES.filter((language) => ['en', 'es'].includes(language) || canUseStaticAiTranslations).map((language) => ({
        value: language,
        text: translate(`languagePage.languages.${language}.label`),
        keyForList: language,
        isSelected: preferredLocale === language,
        shouldShowRightIcon: true,
        rightElement: !['en', 'es'].includes(language) && (
            <Badge
                text={translate('common.ai')}
                icon={Star}
            />
        ),
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
