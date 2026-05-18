import React, {useState} from 'react';
import {View} from 'react-native';
import useBiometricRegistrationStatus, {REGISTRATION_STATUS} from '@hooks/useBiometricRegistrationStatus';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import {revokeMultifactorAuthenticationCredentials} from '@libs/actions/MultifactorAuthentication';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import Button from './Button';
import TestToolRow from './TestToolRow';

function BiometricsTestToolRow() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {localCredentialID, isCurrentDeviceRegistered, otherDeviceCount, registrationStatus} = useBiometricRegistrationStatus();
    const [isMFARevokeLoading, setIsMFARevokeLoading] = useState(false);

    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();

    // Wrapper guards against rapid double-taps on native that would otherwise trigger multiple navigations.
    // Context: https://github.com/Expensify/App/pull/79475#discussion_r2708230681
    const navigateToBiometricsTestPage = singleExecution(
        waitForNavigate(() => {
            Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_BIOMETRICS_TEST);
        }),
    );

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
                    text={translate('multifactorAuthentication.biometricsTest.test')}
                    onPress={() => navigateToBiometricsTestPage()}
                />
                {isCurrentDeviceRegistered && !!localCredentialID && (
                    <Button
                        danger
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
