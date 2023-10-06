import React from 'react';
import * as Illustrations from '../../../../../components/Icon/Illustrations';
import styles from '../../../../../styles/styles';
import BlockingView from '../../../../../components/BlockingViews/BlockingView';
import FixedFooter from '../../../../../components/FixedFooter';
import Button from '../../../../../components/Button';
import variables from '../../../../../styles/variables';
import StepWrapper from '../StepWrapper/StepWrapper';
import useLocalize from '../../../../../hooks/useLocalize';
import * as TwoFactorAuthActions from '../../../../../libs/actions/TwoFactorAuthActions';

function DisabledStep() {
    const {translate} = useLocalize();

    return (
        <StepWrapper title={translate('twoFactorAuth.disableTwoFactorAuth')}>
            <BlockingView
                icon={Illustrations.LockOpen}
                iconWidth={variables.modalTopIconWidth}
                iconHeight={variables.modalTopIconHeight}
                title={translate('twoFactorAuth.disabled')}
                subtitle={translate('twoFactorAuth.noAuthenticatorApp')}
            />
            <FixedFooter style={[styles.flexGrow0]}>
                <Button
                    success
                    text={translate('common.buttonConfirm')}
                    onPress={TwoFactorAuthActions.quitAndNavigateBackToSettings}
                />
            </FixedFooter>
        </StepWrapper>
    );
}

export default DisabledStep;
