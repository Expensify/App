import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import moment from 'moment';
import {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ROUTES from '../../../../ROUTES';
import Text from '../../../../components/Text';
import styles from '../../../../styles/styles';
import Navigation from '../../../../libs/Navigation/Navigation';
import compose from '../../../../libs/compose';
import OptionsList from '../../../../components/OptionsList';
import themeColors from '../../../../styles/themes/default';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import ONYXKEYS from '../../../../ONYXKEYS';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const DateOfBirthYearPage = (props) => {
    const momentDob = moment(lodashGet(props.privatePersonalDetails, 'dob', ''));
    const currentYear = momentDob.year();

    const yearList = _.map(Array.from({length: 200}, (k, v) => v + 1970), (value, index) => ({
        text: value.toString(),
        value,
        keyForList: index,

        // Include the green checkmark icon to indicate the currently selected value
        customIcon: value === currentYear ? greenCheckmark : undefined,

        // This property will make the currently selected value have bold text
        boldStyle: value === currentYear,
    }));

    /**
     * @param {String} selectedYear
     */
    const updateYearOfBirth = (selectedYear) => {
        Navigation.navigate(ROUTES.setSettingsPersonalDetailsDateOfBirthYear(selectedYear));
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('privatePersonalDetails.yearOfBirth')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <Text style={[styles.ph5, styles.mb6]}>
                {props.translate('privatePersonalDetails.selectYearOfBirth')}
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

DateOfBirthYearPage.propTypes = propTypes;
DateOfBirthYearPage.defaultProps = defaultProps;
DateOfBirthYearPage.displayName = 'DateOfBirthYearPage';

export default compose(
    withLocalize,
    withOnyx({
        privatePersonalDetails: {
            key: `${ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM}Draft`,
        },
    }),
)(DateOfBirthYearPage);
