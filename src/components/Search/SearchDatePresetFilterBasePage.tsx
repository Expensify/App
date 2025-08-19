import React, {useCallback, useMemo, useRef, useState} from 'react';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getDatePresets} from '@libs/SearchUIUtils';
import type {SearchDateModifier, SearchDateModifierLower} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SearchDatePresetFilterBase from './SearchDatePresetFilterBase';
import type {SearchDatePresetFilterBaseHandle} from './SearchDatePresetFilterBase';
import type {SearchDateFilterKeys} from './types';

type SearchDatePresetFilterBasePageProps = {
    /** Key used for the date filter */
    dateKey: SearchDateFilterKeys;

    /** The translation key for the page title */
    titleKey: TranslationPaths;
};

function SearchDatePresetFilterBasePage({dateKey, titleKey}: SearchDatePresetFilterBasePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const searchDatePresetFilterBaseRef = useRef<SearchDatePresetFilterBaseHandle>(null);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);

    const defaultDateValues = {
        [CONST.SEARCH.DATE_MODIFIERS.ON]: searchAdvancedFiltersForm?.[`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.ON}`],
        [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: searchAdvancedFiltersForm?.[`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`],
        [CONST.SEARCH.DATE_MODIFIERS.AFTER]: searchAdvancedFiltersForm?.[`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`],
    };

    const presets = useMemo(() => {
        const hasFeed = !!searchAdvancedFiltersForm?.feed?.length;
        return getDatePresets(dateKey, hasFeed);
    }, [dateKey, searchAdvancedFiltersForm?.feed]);

    const title = useMemo(() => {
        if (selectedDateModifier) {
            return translate(`common.${selectedDateModifier.toLowerCase() as SearchDateModifierLower}`);
        }

        return translate(titleKey);
    }, [selectedDateModifier, titleKey, translate]);

    const goBack = useCallback(() => {
        if (selectedDateModifier) {
            setSelectedDateModifier(null);
            return;
        }

        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [selectedDateModifier]);

    const reset = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
            goBack();
            return;
        }

        searchDatePresetFilterBaseRef.current.clearDateValues();
    }, [selectedDateModifier, goBack]);

    const save = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.setDateValueOfSelectedDateModifier();
            goBack();
            return;
        }

        const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
        updateAdvancedFilters({
            [`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.ON}`]: dateValues[CONST.SEARCH.DATE_MODIFIERS.ON] ?? null,
            [`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`]: dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE] ?? null,
            [`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`]: dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER] ?? null,
        });
        goBack();
    }, [selectedDateModifier, goBack, dateKey]);

    return (
        <ScreenWrapper
            testID={SearchDatePresetFilterBasePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={title}
                onBackButtonPress={goBack}
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                <SearchDatePresetFilterBase
                    ref={searchDatePresetFilterBaseRef}
                    defaultDateValues={defaultDateValues}
                    selectedDateModifier={selectedDateModifier}
                    onSelectDateModifier={setSelectedDateModifier}
                    presets={presets}
                />
            </ScrollView>
            <Button
                text={translate('common.reset')}
                onPress={reset}
                style={[styles.mh4, styles.mt4]}
                large
            />
            <FormAlertWithSubmitButton
                buttonText={translate('common.save')}
                containerStyles={[styles.m4, styles.mt3, styles.mb5]}
                onSubmit={save}
                enabledWhenOffline
            />
        </ScreenWrapper>
    );
}

SearchDatePresetFilterBasePage.displayName = 'SearchDatePresetFilterBasePage';

export default SearchDatePresetFilterBasePage;
