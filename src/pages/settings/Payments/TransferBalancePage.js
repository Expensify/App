import React from 'react';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';

const propTypes = {
    ...withLocalizePropTypes,
};

const TransferBalancePage = props => (
    <ScreenWrapper>
        <KeyboardAvoidingView>
            <HeaderWithCloseButton
                title={props.translate('common.transferBalance')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
        </KeyboardAvoidingView>
    </ScreenWrapper>
);

TransferBalancePage.propTypes = propTypes;

export default withLocalize(TransferBalancePage);
