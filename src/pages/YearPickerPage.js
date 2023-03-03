import _ from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ROUTES from '../ROUTES';
import Text from '../components/Text';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import compose from '../libs/compose';
import OptionsList from '../components/OptionsList';
import themeColors from '../styles/themes/default';
import * as Expensicons from '../components/Icon/Expensicons';
import ONYXKEYS from '../ONYXKEYS';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const YearPickerPage = (props) => {
    const {params} = props.route;
    console.log(props.route);
    const minYear = Number(params.min);
    const maxYear = Number(params.max);
    const currentYear = Number(params.year);
    const backTo = params.backTo;

    const yearList = _.map(Array.from({length: (maxYear - minYear) + 1}, (k, v) => v + minYear), (value, index) => ({
        text: value.toString(),
        value,
        keyForList: index.toString(),

        // Include the green checkmark icon to indicate the currently selected value
        customIcon: value === currentYear ? greenCheckmark : undefined,

        // This property will make the currently selected value have bold text
        boldStyle: value === currentYear,
    }));

    /**
     * @param {String} selectedYear
     */
    const updateYearOfBirth = (selectedYear) => {
        // function shouldn't be passed as param to screen, so the only way to generate the path with the param is contatenate strings directly in here
        Navigation.navigate(`${backTo}?year=${selectedYear}`);
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('yearPickerPage.year')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(backTo || ROUTES.HOME)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <Text style={[styles.ph5, styles.mb6]}>
                {props.translate('yearPickerPage.selectYear')}
            </Text>
            <OptionsList
                sections={[{data: yearList}]}
                onSelectRow={option => updateYearOfBirth(option.value)}
                hideSectionHeaders
                optionHoveredStyle={styles.hoveredComponentBG}
                shouldHaveOptionSeparator
                contentContainerStyles={[styles.ph5]}
            />
        </ScreenWrapper>
    );
};

YearPickerPage.propTypes = propTypes;
YearPickerPage.defaultProps = defaultProps;
YearPickerPage.displayName = 'YearPickerPage';

export default compose(
    withLocalize,
    withOnyx({
        privatePersonalDetails: {
            key: `${ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM}Draft`,
        },
    }),
)(YearPickerPage);
