import _ from 'underscore';
import React from 'react';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ExpensifyText from '../../components/ExpensifyText';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize from '../../components/withLocalize';

const SecuritySettingsPage = (props) => (
    <ScreenWrapper>
        <HeaderWithCloseButton
            title={props.translate('initialSettingsPage.about')}
            shouldShowBackButton
            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
            onCloseButtonPress={() => Navigation.dismissModal(true)}
        />
            <ExpensifyText text="Replace me" />
    </ScreenWrapper>
);

SecuritySettingsPage.propTypes = propTypes;
SecuritySettingsPage.displayName = 'SecuritySettingsPage';

export default withLocalize(SecuritySettingsPage);
