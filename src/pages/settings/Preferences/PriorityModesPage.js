import React, { Component } from "react";
import HeaderWithCloseButton from "../../../components/HeaderWithCloseButton";
import ScreenWrapper from "../../../components/ScreenWrapper";
import withLocalize, {withLocalizePropTypes} from "../../../components/withLocalize";
import Navigation from "../../../libs/Navigation/Navigation";
import ROUTES from "../../../ROUTES";

const propTypes = {
    ...withLocalizePropTypes,
};

class PriorityModesPage extends Component {

    render() {
        return <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={this.props.translate('preferencesPage.priorityMode')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PREFERENCES)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
        </ScreenWrapper>;
    }
}

PriorityModesPage.propTypes = propTypes;

export default withLocalize(PriorityModesPage);