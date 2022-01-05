import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import withLocalize from '../components/withLocalize';
import Navigation from '../libs/Navigation/Navigation';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
};


const ReportSettingsPage = (props) => {
    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={this.props.translate('common.settings')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
                onCloseButtonPress={() => NavigationContainer.dismissModal(true)}
            />
        </ScreenWrapper>
    );
}

ReportSettingsPage.propTypes = propTypes;
ReportSettingsPage.displayName = 'ReportSettingsPage';

export default compose(
  withLocalize,
  withOnyx({
  }),
)(ReportSettingsPage);