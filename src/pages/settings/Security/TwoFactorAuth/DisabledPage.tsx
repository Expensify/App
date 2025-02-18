import React from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {quitAndNavigateBack} from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import PageWrapper from './PageWrapper';

function DisabledPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <PageWrapper
            stepName={CONST.TWO_FACTOR_AUTH_STEPS.DISABLED}
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
                    onPress={() => quitAndNavigateBack(ROUTES.SETTINGS_SECURITY)}
                />
            </FixedFooter>
        </PageWrapper>
    );
}

DisabledPage.displayName = 'DisabledPage';

export default DisabledPage;
