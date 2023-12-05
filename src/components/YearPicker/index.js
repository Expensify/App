import {getYear, setYear} from 'date-fns';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useMemo, useState} from 'react';
import _ from 'underscore';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

const propTypes = {
    backTo: PropTypes.string.isRequired,
    minYear: PropTypes.number,
    maxYear: PropTypes.number,
    // value property is number when accessing from Router Stack, will string after string
    route: PropTypes.shape({params: PropTypes.shape({value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])})}).isRequired,
};

const defaultProps = {
    minYear: getYear(setYear(new Date(), CONST.CALENDAR_PICKER.MIN_YEAR)),
    maxYear: getYear(setYear(new Date(), CONST.CALENDAR_PICKER.MAX_YEAR)),
};

function YearPicker(props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchText, setSearchText] = useState('');

    // Value from Query-params or Default to current year
    const selectedYear = lodashGet(props.route, ['params', 'value'], null);

    const [years] = useState(() =>
        _.map(
            Array.from({length: props.maxYear - props.minYear + 1}, (v, i) => i + props.minYear),
            (value) => ({
                text: value.toString(),
                value,
                keyForList: value.toString(),
                // Making sure to match
                isSelected: value === Number(selectedYear),
            }),
        ),
    );

    const {sections, headerMessage} = useMemo(() => {
        const yearsList = searchText === '' ? years : _.filter(years, (year) => year.text.includes(searchText));
        return {
            headerMessage: !yearsList.length ? translate('common.noResultsFound') : '',
            sections: [{data: yearsList, indexOffset: 0}],
        };
    }, [years, searchText, translate]);

    const isLoading = _.isEmpty(years);

    return (
        <ScreenWrapper
            style={[styles.pb0]}
            includeSafeAreaPaddingBottom={false}
            testID={YearPicker.displayName}
        >
            <HeaderWithBackButton
                title={translate('yearPickerPage.year')}
                onBackButtonPress={() => {
                    Navigation.goBack(props.backTo);
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
                        Navigation.goBack(props.backTo);
                        Navigation.setParams({year: option.value});
                    }}
                    initiallyFocusedOptionKey={String(selectedYear)}
                    showScrollIndicator
                    shouldStopPropagation
                />
            )}
        </ScreenWrapper>
    );
}

YearPicker.displayName = 'YearPicker';
YearPicker.propTypes = propTypes;
YearPicker.defaultProps = defaultProps;

export default YearPicker;
