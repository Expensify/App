import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
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
import CONST from '../../../CONST';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const PronounsPage = (props) => {
    const currentPronouns = lodashGet(props.currentUserPersonalDetails, 'pronouns', '');
    const pronounsList = _.map(props.translate('pronouns'), (value, key) => {
        const fullPronounKey = `${CONST.PRONOUNS.PREFIX}${key}`;
        return {
            text: value,
            value: fullPronounKey,
            keyForList: key,

            // Include the green checkmark icon to indicate the currently selected value
            customIcon: fullPronounKey === currentPronouns ? greenCheckmark : undefined,

            // This property will make the currently selected value have bold text
            boldStyle: fullPronounKey === currentPronouns,
        };
    });

    /**
     * @param {String} selectedPronouns
     */
    const updatePronouns = (selectedPronouns) => {
        PersonalDetails.updatePronouns(selectedPronouns);
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('pronounsPage.pronouns')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <Text style={[styles.ph5, styles.mb6]}>
                {props.translate('pronounsPage.isShownOnProfile')}
            </Text>
            <OptionsList
                sections={[{data: pronounsList}]}
                onSelectRow={option => updatePronouns(option.value)}
                hideSectionHeaders
                optionHoveredStyle={styles.hoveredComponentBG}
                shouldHaveOptionSeparator
                contentContainerStyles={[styles.ph5]}
            />
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
