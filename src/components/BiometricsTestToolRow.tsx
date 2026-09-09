import useBiometricRegistrationStatus, {REGISTRATION_STATUS} from '@hooks/useBiometricRegistrationStatus';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

import {revokeMultifactorAuthenticationCredentials} from '@libs/actions/MultifactorAuthentication';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useState} from 'react';
import {View} from 'react-native';

import Button from './ButtonComposed';
import {useMultifactorAuthentication} from './MultifactorAuthentication/Context';
import TestToolRow from './TestToolRow';

function BiometricsTestToolRow() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {executeScenario} = useMultifactorAuthentication();
    const {localCredentialID, isCurrentDeviceRegistered, otherDeviceCount, registrationStatus} = useBiometricRegistrationStatus();
    const {isOffline} = useNetwork();
    const [isMFARevokeLoading, setIsMFARevokeLoading] = useState(false);

    const statusTextMap = {
        [REGISTRATION_STATUS.NEVER_REGISTERED]: translate('multifactorAuthentication.biometricsTest.statusNeverRegistered'),
        [REGISTRATION_STATUS.NOT_REGISTERED]: translate('multifactorAuthentication.biometricsTest.statusNotRegistered'),
        [REGISTRATION_STATUS.REGISTERED_OTHER_DEVICE]: translate('multifactorAuthentication.biometricsTest.statusRegisteredOtherDevice', {count: otherDeviceCount}),
        [REGISTRATION_STATUS.REGISTERED_THIS_DEVICE]: translate('multifactorAuthentication.biometricsTest.statusRegisteredThisDevice'),
    };
    const biometricsTitle = translate('multifactorAuthentication.biometricsTest.troubleshootBiometricsStatus', {status: statusTextMap[registrationStatus]});

    return (
        <TestToolRow title={biometricsTitle}>
            <View style={[styles.flexRow, styles.gap2]}>
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    isDisabled={isOffline}
                    onPress={() => {
                        // When launched from the hidden Test Tools modal (4-finger tap), dismiss that modal so the MFA
                        // overlay isn't hidden behind it on iOS. When rendered inline on the Troubleshoot page there is no
                        // modal on top, so this is a no-op and we don't accidentally open one.
                        if (Navigation.getActiveRoute().includes(ROUTES.TEST_TOOLS_MODAL.route)) {
                            Navigation.dismissModal();
                        }
                        executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST);
                    }}
                >
                    <Button.Text>{translate('multifactorAuthentication.biometricsTest.test')}</Button.Text>
                </Button>
                {isCurrentDeviceRegistered && !!localCredentialID && (
                    <Button
                        variant={CONST.BUTTON_VARIANT.DANGER}
                        isDisabled={isOffline}
                        isLoading={isMFARevokeLoading}
                        size={CONST.BUTTON_SIZE.SMALL}
                        onPress={async () => {
                            setIsMFARevokeLoading(true);
                            await revokeMultifactorAuthenticationCredentials({onlyKeyID: localCredentialID});
                            setIsMFARevokeLoading(false);
                        }}
                    >
                        <Button.Text>{translate('multifactorAuthentication.revoke.revoke')}</Button.Text>
                    </Button>
                )}
            </View>
        </TestToolRow>
    );
}

BiometricsTestToolRow.displayName = 'BiometricsTestToolRow';

export default BiometricsTestToolRow;
