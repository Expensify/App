import React, { Component } from "react";
import HeaderWithCloseButton from "../../../components/HeaderWithCloseButton";
import ScreenWrapper from "../../../components/ScreenWrapper";
import withLocalize, {withLocalizePropTypes} from "../../../components/withLocalize";
import Navigation from "../../../libs/Navigation/Navigation";
import ROUTES from "../../../ROUTES";
import CONST from '../../../CONST';
import OptionsList from "../../../components/OptionsList";
import styles from "../../../styles/styles";

const propTypes = {
    ...withLocalizePropTypes,
};

const PriorityModesPage = (props) => {

    const priorityModes = [
        {
            value: CONST.PRIORITY_MODE.DEFAULT,
            text: props.translate('preferencesPage.mostRecent'),
            keyForList: 'default',
            description: props.translate('preferencesPage.mostRecentModeDescription'),
        },
        {
            value: CONST.PRIORITY_MODE.GSD,
            text: props.translate('preferencesPage.focus'),
            keyForList: 'gsd',
            description: props.translate('preferencesPage.focusModeDescription'),
        },
    ];

        return (<ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('preferencesPage.priorityMode')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PREFERENCES)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <OptionsList
                sections={[{data: priorityModes}]}
                // onSelectRow={option => updatePronouns(option.value)}
                hideSectionHeaders
                optionHoveredStyle={styles.hoveredComponentBG}
                shouldHaveOptionSeparator
                contentContainerStyles={[styles.ph5]}
            />
        </ScreenWrapper>);
}

PriorityModesPage.propTypes = propTypes;

export default withLocalize(PriorityModesPage);