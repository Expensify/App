import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import * as Illustrations from '../../../../../components/Icon/Illustrations';
import styles from '../../../../../styles/styles';
import BlockingView from '../../../../../components/BlockingViews/BlockingView';
import FixedFooter from '../../../../../components/FixedFooter';
import Button from '../../../../../components/Button';
import variables from '../../../../../styles/variables';
import StepWrapper from '../StepWrapper/StepWrapper';
import useLocalize from '../../../../../hooks/useLocalize';
import * as TwoFactorAuthActions from '../../../../../libs/actions/TwoFactorAuthActions';
import {TwoFactorAuthPropTypes} from '../TwoFactorAuthPropTypes';
import ONYXKEYS from '../../../../../ONYXKEYS';
import Navigation from '../../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../../ROUTES';
import CONST from '../../../../../CONST';

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

export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
})(DisabledStep);
