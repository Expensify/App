import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import moment from 'moment';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ROUTES from '../../../../ROUTES';
import Text from '../../../../components/Text';
import styles from '../../../../styles/styles';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../../libs/actions/PersonalDetails';
import compose from '../../../../libs/compose';
import OptionsList from '../../../../components/OptionsList';
import themeColors from '../../../../styles/themes/default';
import * as Expensicons from '../../../../components/Icon/Expensicons';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const DateOfBirthMonthPage = (props) => {
    const currentYear = lodashGet(props.currentUserPersonalDetails, 'year', '');
    const yearList = _.map(moment.localeData('en').months(), (value, index) => ({
        text: value,
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
        // TODO:
        PersonalDetails.updateDateOfBirth(selectedYear);
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton

                // TODO:  title={props.translate('pronounsPage.pronouns')}
                title="Year of Birth"
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <Text style={[styles.ph5, styles.mb6]}>
                {/* TODO:  {props.translate('pronounsPage.isShownOnProfile')} */}
                Select Month of birth
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

DateOfBirthMonthPage.propTypes = propTypes;
DateOfBirthMonthPage.defaultProps = defaultProps;
DateOfBirthMonthPage.displayName = 'DateOfBirthMonthPage';

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
)(DateOfBirthMonthPage);
