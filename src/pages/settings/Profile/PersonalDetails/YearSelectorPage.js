import {getYear, subYears} from 'date-fns';
import lodashGet from 'lodash/get';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import _ from 'underscore';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function YearSelectorPage(props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchText, setSearchText] = useState('');

    const minDate = useRef(subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE));
    const maxDate = useRef(subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE));

    const minYear = getYear(new Date(minDate.current));
    const maxYear = getYear(new Date(maxDate.current));

    // Value from Query-params or Default to current year
    const selectedYear = lodashGet(props, ['route', 'params', 'value'], null);

    const [years] = useState(() =>
        _.map(
            Array.from({length: maxYear - minYear + 1}, (v, i) => i + minYear),
            (value) => ({
                text: value.toString(),
                value,
                keyForList: value.toString(),
                isSelected: value === selectedYear,
            }),
        ),
    );

    useEffect(() => {
        if (selectedYear) {
            return;
        }
        Navigation.isNavigationReady().then(() => {
            Navigation.goBack();
        });
    }, [selectedYear]);

    const {sections, headerMessage} = useMemo(() => {
        const yearsList = searchText === '' ? years : _.filter(years, (year) => year.text.includes(searchText));
        return {
            headerMessage: !yearsList.length ? translate('common.noResultsFound') : '',
            sections: [{data: yearsList, indexOffset: 0}],
        };
    }, [years, searchText, translate]);

    const isLoading = _.isEmpty(years) || !selectedYear;

    return (
        <ScreenWrapper
            style={[styles.pb0]}
            includeSafeAreaPaddingBottom={false}
            testID={YearSelectorPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('yearPickerPage.year')}
                onBackButtonPress={() => {
                    Navigation.goBack();
                }}
            />
            {isLoading ? (
                <FullScreenLoadingIndicator />
            ) : (
                <SelectionList
                    shouldDelayFocus
                    textInputLabel={translate('yearPickerPage.selectYear')}
                    textInputValue={searchText}
                    textInputMaxLength={4}
                    onChangeText={(text) => setSearchText(text.replace(CONST.REGEX.NON_NUMERIC, '').trim())}
                    inputMode={CONST.INPUT_MODE.NUMERIC}
                    headerMessage={headerMessage}
                    sections={sections}
                    onSelectRow={(option) => {
                        Navigation.goBack(ROUTES.SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH);
                        Navigation.setParams({year: option.value});
                    }}
                    initiallyFocusedOptionKey={selectedYear.toString()}
                    showScrollIndicator
                    shouldStopPropagation
                />
            )}
        </ScreenWrapper>
    );
}

YearSelectorPage.displayName = 'YearSelectorPage';

export default YearSelectorPage;
