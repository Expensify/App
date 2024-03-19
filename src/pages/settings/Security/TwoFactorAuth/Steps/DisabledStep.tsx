import React from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import variables from '@styles/variables';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';

function DisabledStep() {
    const styles = useThemeStyles();
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
                    large
                    text={translate('common.buttonConfirm')}
                    onPress={() => TwoFactorAuthActions.quitAndNavigateBack()}
                />
            </FixedFooter>
        </StepWrapper>
    );
}

DisabledStep.displayName = 'DisabledStep';

export default DisabledStep;
