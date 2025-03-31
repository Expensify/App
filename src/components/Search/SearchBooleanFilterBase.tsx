import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SearchMultipleSelectionPicker from './SearchMultipleSelectionPicker';
import type {SearchBooleanFilterKeys} from './types';

type SearchBooleanFilterBaseProps = {
    /** Key used for the boolean filter */
    booleanKey: SearchBooleanFilterKeys;

    /** The translation key for the page title */
    titleKey: TranslationPaths;
};

function SearchBooleanFilterBase({booleanKey, titleKey}: SearchBooleanFilterBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const booleanValues = Object.values(CONST.SEARCH.BOOLEAN);

    const items = useMemo(() => {
        return booleanValues.map((value) => {
            const name = translate(`common.${value}`);
            return {name, value};
        });
    }, [booleanValues, translate]);

    const initiallySelectedItems = useMemo(() => {
        return searchAdvancedFiltersForm?.[booleanKey]
            ?.filter((value) => Object.values(CONST.SEARCH.BOOLEAN).includes(value as ValueOf<typeof CONST.SEARCH.BOOLEAN>))
            .map((value) => {
                const name = translate(`common.${value as ValueOf<typeof CONST.SEARCH.BOOLEAN>}`);
                return {name, value};
            });
    }, [booleanKey, searchAdvancedFiltersForm, translate]);

    const updateFilter = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({[booleanKey]: values}), [booleanKey]);

    return (
        <ScreenWrapper
            testID={SearchBooleanFilterBase.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate(titleKey)}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    disableSort
                    items={items}
                    shouldShowTextInput={false}
                    initiallySelectedItems={initiallySelectedItems}
                    onSaveSelection={updateFilter}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchBooleanFilterBase.displayName = 'SearchBooleanFilterBase';

export default SearchBooleanFilterBase;
