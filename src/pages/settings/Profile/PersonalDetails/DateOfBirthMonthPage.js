import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import moment from 'moment';
import {withOnyx} from 'react-native-onyx';
import {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ROUTES from '../../../../ROUTES';
import * as FormActions from '../../../../libs/actions/FormActions';
import Text from '../../../../components/Text';
import styles from '../../../../styles/styles';
import Navigation from '../../../../libs/Navigation/Navigation';
import compose from '../../../../libs/compose';
import OptionsList from '../../../../components/OptionsList';
import themeColors from '../../../../styles/themes/default';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const DateOfBirthMonthPage = (props) => {
    const momentDob = moment(lodashGet(props.privatePersonalDetails, 'dob', ''));
    const currentMonth = momentDob.month();

    const monthList = _.map(moment.localeData('en').months(), (value, index) => ({
        text: value,
        value: index,
        keyForList: index,

        // Include the green checkmark icon to indicate the currently selected value
        customIcon: value === currentMonth ? greenCheckmark : undefined,

        // This property will make the currently selected value have bold text
        boldStyle: value === currentMonth,
    }));

    /**
     * @param {String} selectedMonth
     */
    const updateMonthOfBirth = (selectedMonth) => {
        momentDob.set('month', Number(selectedMonth));
        const dob = momentDob.format(CONST.DATE.MOMENT_FORMAT_STRING);
        FormActions.setDraftValues(ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM, {dob});
        Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH);
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('privatePersonalDetails.monthOfBirth')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <Text style={[styles.ph5, styles.mb6]}>
                {props.translate('privatePersonalDetails.selectMonthOfBirth')}
            </Text>
            <OptionsList
                sections={[{data: monthList}]}
                onSelectRow={option => updateMonthOfBirth(option.value)}
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
    withOnyx({
        privatePersonalDetails: {
            key: `${ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM}Draft`,
        },
    }),
)(DateOfBirthMonthPage);
