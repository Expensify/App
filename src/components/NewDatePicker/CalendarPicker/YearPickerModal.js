import React, {useEffect, useMemo, useState, useCallback} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import moment from 'moment';
import HeaderWithBackButton from '../../HeaderWithBackButton';
import CONST from '../../../CONST';
import SelectionList from '../../SelectionList';
import Modal from '../../Modal';
import {radioListItemPropTypes} from '../../SelectionList/selectionListPropTypes';
import useLocalize from '../../../hooks/useLocalize';
import ScreenWrapper from '../../ScreenWrapper';
import styles from '../../../styles/styles';
import lodashGet from 'lodash/get';
import Navigation from '../../../libs/Navigation/Navigation';

const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** Currently selected country */
            country: PropTypes.string,

            /** Route to navigate back after selecting a currency */
            backTo: PropTypes.string,
        }),
    }).isRequired,

    /** Navigation from react-navigation */
    navigation: PropTypes.shape({
        /** getState function retrieves the current navigation state from react-navigation's navigation property */
        getState: PropTypes.func.isRequired,
    }).isRequired,
};

function YearPickerModal(props) {
    const minYear = moment().subtract(CONST.DATE_BIRTH.MAX_AGE, 'years').year();
    const maxYear = moment().subtract(CONST.DATE_BIRTH.MIN_AGE, 'years').year();
    const currentYear = lodashGet(props, 'route.params.year');
    const years = useMemo(
        () =>
            _.map(
                Array.from({length: maxYear - minYear + 1}, (_, i) => minYear + i),
                (year) => {
                    return {
                        value: year,
                        keyForList: year.toString(),
                        text: year.toString(),
                        isSelected: currentYear.toString() === year.toString(),
                    };
                },
            ),
        [currentYear, maxYear, minYear],
    );

    const {route, navigation} = props;
    const {translate} = useLocalize();
    const [searchText, setSearchText] = useState('');
    const {sections, headerMessage} = useMemo(() => {
        const yearsList = searchText === '' ? years : _.filter(years, (year) => year.text.includes(searchText));
        return {
            headerMessage: !yearsList.length ? translate('common.noResultsFound') : '',
            sections: [{data: yearsList, indexOffset: 0}],
        };
    }, [years, searchText, translate]);

    console.log('years', minYear, maxYear);

    useEffect(() => {
        if (props.isVisible) {
            return;
        }
        setSearchText('');
    }, [props.isVisible]);

    const selectYear = useCallback(
        (option) => {
            const backTo = lodashGet(route, 'params.backTo', '');

            // Check the navigation state and "backTo" parameter to decide navigation behavior
            if (navigation.getState().routes.length === 1 && _.isEmpty(backTo)) {
                // If there is only one route and "backTo" is empty, go back in navigation
                Navigation.goBack();
            } else if (!_.isEmpty(backTo) && navigation.getState().routes.length === 1) {
                // If "backTo" is not empty and there is only one route, go back to the specific route defined in "backTo" with a country parameter
                Navigation.goBack(`${route.params.backTo}?year=${option.value}`);
            } else {
                // Otherwise, navigate to the specific route defined in "backTo" with a country parameter
                Navigation.navigate(`${route.params.backTo}?year=${option.value}`);
            }
        },
        [route, navigation],
    );

    return (
        <ScreenWrapper
            style={[styles.pb0]}
            includePaddingTop={false}
            includeSafeAreaPaddingBottom={false}
            testID={YearPickerModal.displayName}
        >
            <HeaderWithBackButton
                title={translate('yearPickerPage.year')}
                onBackButtonPress={() => {
                    const backTo = lodashGet(route, 'params.backTo', '');
                    const backToRoute = backTo ? `${backTo}?year=${currentYear}` : '';
                    Navigation.goBack(backToRoute);
                }}
            />
            <SelectionList
                shouldDelayFocus
                textInputLabel={translate('yearPickerPage.selectYear')}
                textInputValue={searchText}
                textInputMaxLength={4}
                onChangeText={(text) => setSearchText(text.replace(CONST.REGEX.NON_NUMERIC, '').trim())}
                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                headerMessage={headerMessage}
                sections={sections}
                onSelectRow={selectYear}
                initiallyFocusedOptionKey={currentYear.toString()}
                showScrollIndicator
            />
        </ScreenWrapper>
    );
}

YearPickerModal.propTypes = propTypes;
YearPickerModal.displayName = 'YearPickerModal';

export default YearPickerModal;
