import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ROUTES from '../../../ROUTES';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import compose from '../../../libs/compose';
import OptionsList from '../../../components/OptionsList';
import themeColors from '../../../styles/themes/default';
import * as Expensicons from '../../../components/Icon/Expensicons';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const PronounsPage = (props) => {
    const currentPronouns = lodashGet(props.currentUserPersonalDetails, 'pronouns', '');
    const pronounsList = _.map(props.translate('pronouns'), (value, key) => ({
        text: value,
        value: key,
        keyForList: key,

        // Add green checkmark icon & bold the timezone text
        customIcon: key === currentPronouns
            ? {src: Expensicons.Checkmark, color: themeColors.textSuccess}
            : null,
        isUnread: key === currentPronouns,
    }));

    /**
     * @param {String} selectedPronouns
     */
    const updatePronouns = (selectedPronouns) => {
        PersonalDetails.updatePronouns(selectedPronouns);
    };

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('pronounsPage.pronouns')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <View style={[styles.ph5]}>
                <Text style={[styles.mb6]}>
                    {props.translate('pronounsPage.isShownOnProfile')}
                </Text>
                <OptionsList
                    sections={[{data: pronounsList}]}
                    onSelectRow={option => updatePronouns(option.value)}
                    hideSectionHeaders
                    optionHoveredStyle={styles.hoveredComponentBG}
                    shouldHaveOptionSeparator
                />
            </View>
        </ScreenWrapper>
    );
};

PronounsPage.propTypes = propTypes;
PronounsPage.defaultProps = defaultProps;
PronounsPage.displayName = 'PronounsPage';

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
)(PronounsPage);
