import React from 'react';
import HeaderWithCloseButton from "../../../../components/HeaderWithCloseButton";
import ScreenWrapper from "../../../../components/ScreenWrapper";
import withLocalize, {withLocalizePropTypes} from "../../../../components/withLocalize";
import Navigation from "../../../../libs/Navigation/Navigation";
import ROUTES from "../../../../ROUTES";

const propTypes = {
    ...withLocalizePropTypes,
};

const NewContactMethodPage = (props) => {
    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('contacts.newContactMethod')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
        </ScreenWrapper>
    );
}

NewContactMethodPage.displayName = 'NewContactMethodPage';
NewContactMethodPage.propTypes = propTypes;

export default withLocalize(NewContactMethodPage);
