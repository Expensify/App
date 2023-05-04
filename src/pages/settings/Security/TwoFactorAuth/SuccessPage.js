import React from 'react';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import ROUTES from '../../../../ROUTES';
import FullPageOfflineBlockingView from '../../../../components/BlockingViews/FullPageOfflineBlockingView';
import * as Illustrations from '../../../../components/Icon/Illustrations';
import styles from '../../../../styles/styles';
import BlockingView from '../../../../components/BlockingViews/BlockingView';
import FixedFooter from '../../../../components/FixedFooter';
import Button from '../../../../components/Button';

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {
};

function SuccessPage(props) {
    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('twoFactorAuth.headerTitle')}
                subtitle={props.translate('twoFactorAuth.stepSuccess')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />

            <FullPageOfflineBlockingView>
                <BlockingView
                    icon={Illustrations.Fireworks}
                    iconColor={null}
                    iconWidth={200}
                    iconHeight={164}
                    title={props.translate('twoFactorAuth.enabled')}
                    subtitle={props.translate('twoFactorAuth.congrats')}
                />
                <FixedFooter style={[styles.flexGrow0]}>
                    <Button
                        success
                        text={props.translate('common.buttonConfirm')}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_TWO_FACTOR_IS_ENABLED)}
                    />
                </FixedFooter>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

SuccessPage.propTypes = propTypes;
SuccessPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
    }),
)(SuccessPage);
