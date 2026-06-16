import {useEffect, useState} from 'react';
import RequireTwoFactorAuthenticationModal from '@components/RequireTwoFactorAuthenticationModal';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';
import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {openLink} from '@userActions/Link';
import type SCREENS from '@src/SCREENS';

type XeroSetupPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.XERO_SETUP>;

function XeroSetupPage({route}: XeroSetupPageProps) {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const policyID = route.params.policyID;

    const {is2FAEnabled, getTwoFactorAuthRoute} = useTwoFactorAuthRoute();
    const [isRequire2FAModalOpen, setIsRequire2FAModalOpen] = useState(!is2FAEnabled);

    useEffect(() => {
        if (!is2FAEnabled) {
            return;
        }
        openLink(getXeroSetupLink(policyID), environmentURL);
    }, [is2FAEnabled, policyID, environmentURL]);

    if (!is2FAEnabled) {
        return (
            <RequireTwoFactorAuthenticationModal
                onSubmit={() => {
                    setIsRequire2FAModalOpen(false);
                    close(() => {
                        Navigation.navigate(getTwoFactorAuthRoute());
                    });
                }}
                onCancel={() => {
                    setIsRequire2FAModalOpen(false);
                    Navigation.goBack();
                }}
                isVisible={isRequire2FAModalOpen}
                description={translate('twoFactorAuth.twoFactorAuthIsRequiredDescription')}
            />
        );
    }

    return null;
}

export default XeroSetupPage;
