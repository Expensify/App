import React from "react";
import HeaderWithCloseButton from "../../../components/HeaderWithCloseButton";
import ScreenWrapper from "../../../components/ScreenWrapper";
import withLocalize, { withLocalizePropTypes } from "../../../components/withLocalize";
import Navigation from "../../../libs/Navigation/Navigation";
import ROUTES from "../../../ROUTES";
import { compose } from "underscore";
import { withOnyx } from "react-native-onyx";
import ONYXKEYS from "../../../ONYXKEYS";

const propTypes = {
    ...withLocalizePropTypes,
};

const LanguagesPage = (props) => {

    return (<ScreenWrapper includeSafeAreaPaddingBottom={false}>
        <HeaderWithCloseButton
            title={props.translate('languagesPage.language')}
            shouldShowBackButton
            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PREFERENCES)}
            onCloseButtonPress={() => Navigation.dismissModal(true)}
        />
    </ScreenWrapper>);
}

LanguagesPage.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    }),
)(LanguagesPage);