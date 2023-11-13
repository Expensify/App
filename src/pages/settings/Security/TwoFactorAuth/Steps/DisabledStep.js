import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import {TwoFactorAuthPropTypes} from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthPropTypes';
import styles from '@styles/styles';
import variables from '@styles/variables';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function DisabledStep({account}) {
    const {translate} = useLocalize();

    useEffect(() => {
        if (account.twoFactorAuthStep === 'DISABLED') {
            return;
        }

        if (account.requiresTwoFactorAuth) {
            Navigation.navigate(ROUTES.SETTINGS_2FA.ENABLED, CONST.NAVIGATION.TYPE.FORCED_UP);
        } else {
            Navigation.navigate(ROUTES.SETTINGS_2FA.CODES, CONST.NAVIGATION.TYPE.FORCED_UP);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

DisabledStep.propTypes = TwoFactorAuthPropTypes;
DisabledStep.displayName = 'DisabledStep';

export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
})(DisabledStep);
