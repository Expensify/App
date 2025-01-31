import React from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {quitAndNavigateBack} from '@userActions/TwoFactorAuthActions';
import PageWrapper from './PageWrapper';

function DisabledStepPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <PageWrapper
            stepName={DisabledStepPage.displayName}
            title={translate('twoFactorAuth.disableTwoFactorAuth')}
        >
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
                    onPress={() => quitAndNavigateBack()}
                />
            </FixedFooter>
        </PageWrapper>
    );
}

DisabledStepPage.displayName = 'DisabledStepPage';

export default DisabledStepPage;
