import React, {useEffect} from 'react';
import Navigation from '../../../../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../../../../components/withLocalize';
import ROUTES from '../../../../../ROUTES';
import * as Illustrations from '../../../../../components/Icon/Illustrations';
import styles from '../../../../../styles/styles';
import BlockingView from '../../../../../components/BlockingViews/BlockingView';
import FixedFooter from '../../../../../components/FixedFooter';
import Button from '../../../../../components/Button';
import variables from '../../../../../styles/variables';
import StepWrapper from "../StepWrapper/StepWrapper";

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {};

function DisableStep(props) {
    useEffect(() => {
        // Session.toggleTwoFactorAuth(false);
    }, []);

    return (
        <StepWrapper
            title={props.translate('twoFactorAuth.disableTwoFactorAuth')}
        >
            <BlockingView
                icon={Illustrations.LockOpen}
                iconWidth={variables.modalTopIconWidth}
                iconHeight={variables.modalTopIconHeight}
                title={props.translate('twoFactorAuth.disabled')}
                subtitle={props.translate('twoFactorAuth.noAuthenticatorApp')}
            />
            <FixedFooter style={[styles.flexGrow0]}>
                <Button
                    success
                    text={props.translate('common.buttonConfirm')}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
                />
            </FixedFooter>
        </StepWrapper>
    );
}

DisableStep.propTypes = propTypes;
DisableStep.defaultProps = defaultProps;

export default withLocalize(DisableStep);
