import React, {useState} from 'react';
import {View} from 'react-native';
import useBiometricRegistrationStatus, {REGISTRATION_STATUS} from '@hooks/useBiometricRegistrationStatus';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {revokeMultifactorAuthenticationCredentials} from '@libs/actions/MultifactorAuthentication';
import toggleTestToolsModal from '@userActions/TestTool';
import CONST from '@src/CONST';
import Button from './Button';
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
                    small
                    isDisabled={isOffline}
                    text={translate('multifactorAuthentication.biometricsTest.test')}
                    onPress={() => {
                        toggleTestToolsModal();
                        executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST);
                    }}
                />
                {isCurrentDeviceRegistered && !!localCredentialID && (
                    <Button
                        danger
                        isDisabled={isOffline}
                        isLoading={isMFARevokeLoading}
                        small
                        text={translate('multifactorAuthentication.revoke.revoke')}
                        onPress={async () => {
                            setIsMFARevokeLoading(true);
                            await revokeMultifactorAuthenticationCredentials({onlyKeyID: localCredentialID});
                            setIsMFARevokeLoading(false);
                        }}
                    />
                )}
            </View>
        </TestToolRow>
    );
}

BiometricsTestToolRow.displayName = 'BiometricsTestToolRow';

export default BiometricsTestToolRow;
