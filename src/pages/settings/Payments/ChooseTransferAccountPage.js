import React from 'react';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView/index';

const propTypes = {
    ...withLocalizePropTypes,
};

const ChooseTransferAccountPage = (
    <ScreenWrapper>
        <KeyboardAvoidingView>
            <HeaderWithCloseButton
                title={this.props.translate('chooseTransferAccountPage.chooseAccount')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
                onCloseButtonPress={() => Navigation.dismissModal()}
            />
        </KeyboardAvoidingView>
    </ScreenWrapper>
);

ChooseTransferAccountPage.propTypes = propTypes;

export default withLocalize(ChooseTransferAccountPage);
