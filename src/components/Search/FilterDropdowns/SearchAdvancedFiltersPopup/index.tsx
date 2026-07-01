import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import SafeTriangle from '@components/SafeTriangle';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
import SearchAdvancedFiltersContent from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import type {SearchQueryJSON} from '@components/Search/types';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getButtonState from '@libs/getButtonState';
import Navigation from '@libs/Navigation/Navigation';
import type {SearchFilter} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import AmountFilterContentPopupWrapper from './AmountFilterContentPopupWrapper';
import CommonFilterContentPopupWrapper from './CommonFilterContentPopupWrapper';
import DateFilterContentPopupWrapper from './DateFilterContentPopupWrapper';
import ReportFieldFilterContentPopupWrapper from './ReportFieldFilterContentPopupWrapper';
import TextInputFilterContentPopupWrapper from './TextInputFilterContentPopupWrapper';

type SearchAdvancedFiltersPopupProps = {
    queryJSON: SearchQueryJSON;
};

function SearchAdvancedFiltersPopup({queryJSON}: SearchAdvancedFiltersPopupProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const [selectedFilter, setSelectedFilter] = useState<SearchFilter['key']>(CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE);
    const filterContentRef = useRef<View>(null);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles', 'ArrowRight']);

    const {updateFilterQueryParams} = useUpdateFilterQuery(queryJSON);

    return (
        <SafeTriangle submenuRef={filterContentRef}>
            <View style={[styles.flexRow, StyleUtils.getHeight(Math.min(windowHeight, CONST.ADVANCED_FILTERS_POPOVER_HEIGHT))]}>
                <View style={[styles.typeFiltersPopupContainer]}>
                    <PressableWithFeedback
                        style={({pressed}) => [styles.typeFilterMenu, pressed ? styles.buttonHoveredBG : undefined]}
                        accessible
                        accessibilityLabel={translate('search.filters.describeSearch.title')}
                        role={CONST.ROLE.BUTTON}
                        sentryLabel="SearchAdvancedFiltersPopup-DescribeSearch"
                        onPress={() => Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS_DESCRIBE)}
                    >
                        {({pressed}) => (
                            <>
                                <Icon
                                    src={icons.Sparkles}
                                    fill={theme.icon}
                                    width={variables.iconSizeSmall}
                                    height={variables.iconSizeSmall}
                                />
                                <Text style={[styles.flex1]}>{translate('search.filters.describeSearch.title')}</Text>
                                <Icon
                                    src={icons.ArrowRight}
                                    fill={StyleUtils.getIconFillColor(getButtonState(false, pressed))}
                                    width={variables.iconSizeNormal}
                                    height={variables.iconSizeNormal}
                                />
                            </>
                        )}
                    </PressableWithFeedback>
                    <SpacerView
                        shouldShow
                        style={[styles.reportHorizontalRule]}
                    />
                    <FilterList
                        type={searchAdvancedFiltersForm?.type}
                        policyID={searchAdvancedFiltersForm?.policyID}
                        selectedFilter={selectedFilter}
                        onHoverIn={setSelectedFilter}
                        onFocus={setSelectedFilter}
                    />
                </View>
                <View
                    ref={filterContentRef}
                    style={[styles.filterContentContainer]}
                >
                    <SearchAdvancedFiltersContent
                        values={searchAdvancedFiltersForm}
                        filterKey={selectedFilter}
                        policyIDQuery={queryJSON.policyID}
                        components={{
                            Common: CommonFilterContentPopupWrapper,
                            Text: TextInputFilterContentPopupWrapper,
                            Amount: AmountFilterContentPopupWrapper,
                            Date: DateFilterContentPopupWrapper,
                            ReportField: ReportFieldFilterContentPopupWrapper,
                        }}
                        onChange={updateFilterQueryParams}
                    />
                </View>
            </View>
        </SafeTriangle>
    );
}

export default SearchAdvancedFiltersPopup;
