import React, {Fragment, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {SearchCustomColumnIds} from '@components/Search/types';
import type {ListItem} from '@components/SelectionList/types';
import SelectionList from '@components/SelectionListWithSections';
import MultiSelectListItem from '@components/SelectionListWithSections/MultiSelectListItem';
import type {SectionListDataType} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import {getCustomColumnDefault, getCustomColumns, getSearchColumnTranslationKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import arraysEqual from '@src/utils/arraysEqual';

function SearchColumnsPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const groupBy = searchAdvancedFiltersForm?.groupBy;
    const queryType = searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;

    const allTypeCustomColumns = getCustomColumns(queryType);
    const defaultCustomColumns = getCustomColumnDefault(queryType);

    const allGroupByCustomColumns = getCustomColumns(groupBy);
    const groupByDefaultColumns = getCustomColumnDefault(groupBy);

    const allDefaultColumns = [...defaultCustomColumns, ...groupByDefaultColumns];

    const [selectedColumnIds, setSelectedColumnIds] = useState<SearchCustomColumnIds[]>(() => {
        const typeColumnIds = searchAdvancedFiltersForm?.columns?.filter((columnId) => allTypeCustomColumns.includes(columnId)) ?? [];
        const groupByColumnIds = searchAdvancedFiltersForm?.columns?.filter((columnId) => allGroupByCustomColumns.includes(columnId)) ?? [];

        const columnIds: SearchCustomColumnIds[] = [];

        // We dont allow the user to unselect all columns, so we can assume that no type columns = default columns
        if (!typeColumnIds.length) {
            columnIds.push(...defaultCustomColumns);
        } else {
            columnIds.push(...typeColumnIds);
        }

        // We dont allow the user to unselect all columns, so we can assume that no groupBy columns = default columns
        if (!groupByColumnIds.length) {
            columnIds.push(...groupByDefaultColumns);
        } else {
            columnIds.push(...groupByColumnIds);
        }

        return columnIds;
    });

    const sections: Array<SectionListDataType<ListItem>> = [];

    if (groupBy) {
        sections.push({
            title: undefined,
            CustomSectionHeader() {
                if (!groupBy) {
                    return null;
                }

                return (
                    <View style={[styles.ph5, styles.pv2]}>
                        <Text style={[styles.labelStrong]}>{translate('search.groupColumns')}</Text>
                    </View>
                );
            },
            data: allGroupByCustomColumns.map((columnId) => ({
                text: translate(getSearchColumnTranslationKey(columnId)),
                value: columnId,
                keyForList: columnId,
                isSelected: selectedColumnIds?.includes(columnId),
            })),
        });
    }

    sections.push({
        title: undefined,
        CustomSectionHeader() {
            if (!groupBy) {
                return null;
            }

            return (
                <Fragment>
                    <View>
                        <View style={styles.dividerLine} />
                    </View>
                    <View style={[styles.ph5, styles.pv2]}>
                        <Text style={[styles.labelStrong]}>{translate('search.expenseColumns')}</Text>
                    </View>
                </Fragment>
            );
        },
        data: allTypeCustomColumns.map((columnId) => ({
            text: translate(getSearchColumnTranslationKey(columnId)),
            value: columnId,
            keyForList: columnId,
            isSelected: selectedColumnIds?.includes(columnId),
        })),
    });

    const sortedDefaultColumns = [...allDefaultColumns].sort();
    const sortedSelectedColumnIds = [...selectedColumnIds].sort();
    const isDefaultColumns = arraysEqual(sortedSelectedColumnIds, sortedDefaultColumns);

    const onSelectItem = (item: ListItem) => {
        const updatedColumnId = item.keyForList as SearchCustomColumnIds;

        if (item.isSelected) {
            setSelectedColumnIds(selectedColumnIds.filter((columnId) => columnId !== updatedColumnId));
        } else {
            setSelectedColumnIds([...selectedColumnIds, updatedColumnId]);
        }
    };

    const resetColumns = () => {
        setSelectedColumnIds(allDefaultColumns);
    };

    const applyChanges = () => {
        if (!selectedColumnIds.length) {
            return;
        }

        const updatedAdvancedFilters: Partial<SearchAdvancedFiltersForm> = {...searchAdvancedFiltersForm, columns: isDefaultColumns ? undefined : selectedColumnIds};
        const queryString = buildQueryStringFromFilterFormValues(updatedAdvancedFilters);

        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryString}), {forceReplace: true});
    };

    const hasSelectedTypeColumns = selectedColumnIds.some((columnId) => allTypeCustomColumns.includes(columnId));
    const hasSelectedGroupByColumns = selectedColumnIds.some((columnId) => allGroupByCustomColumns.includes(columnId));
    const showMissingColumnError = !hasSelectedTypeColumns || (!!groupBy && !hasSelectedGroupByColumns);

    return (
        <ScreenWrapper
            testID="SearchColumnsPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('search.columns')}>
                {!isDefaultColumns && <TextLink onPress={resetColumns}>{translate('search.resetColumns')}</TextLink>}
            </HeaderWithBackButton>
            <View style={[styles.flex1]}>
                <SelectionList
                    sections={sections}
                    onSelectRow={onSelectItem}
                    shouldStopPropagation
                    shouldShowTooltips
                    canSelectMultiple
                    ListItem={MultiSelectListItem}
                    headerMessageStyle={[styles.labelStrong]}
                    sectionTitleStyles={[styles.labelStrong]}
                    footerContent={
                        <View style={[styles.gap2]}>
                            {!showMissingColumnError && (
                                <DotIndicatorMessage
                                    type="error"
                                    style={[styles.mt3]}
                                    messages={{error: translate('search.noColumnsError')}}
                                />
                            )}

                            <Button
                                large
                                success
                                pressOnEnter
                                style={[styles.mt3]}
                                text={translate('common.save')}
                                onPress={applyChanges}
                            />
                        </View>
                    }
                />
            </View>
        </ScreenWrapper>
    );
}

export default SearchColumnsPage;
