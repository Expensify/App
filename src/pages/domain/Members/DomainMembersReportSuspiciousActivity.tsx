import React from 'react';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import LockAccountPageBase from '@pages/settings/Security/LockAccount/LockAccountPageBase';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainMembersReportSuspiciousActivityProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_REPORT_SUSPICIOUS_ACTIVITY>;

function DomainMembersReportSuspiciousActivity({route}: DomainMembersReportSuspiciousActivityProps) {
    const {domainAccountID, accountID} = route.params;

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const memberLogin = personalDetails?.[accountID]?.login ?? '';

    const {translate} = useLocalize();

    const confirmModalPrompt = translate('domain.members.reportSuspiciousActivityConfirmationPrompt');

    const lockAccountPagePrompt = (
        <Text>
            <RenderHTML html={translate('domain.members.reportSuspiciousActivityPrompt', memberLogin)} />
        </Text>
    );

    const handleLockRequestFinish = () => {
        Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <LockAccountPageBase
                testID="DomainMembersReportSuspiciousActivity"
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_LOCK_ACCOUNT)}
                confirmModalPrompt={confirmModalPrompt}
                lockAccountPagePrompt={lockAccountPagePrompt}
                handleLockRequestFinish={handleLockRequestFinish}
            />
        </DomainNotFoundPageWrapper>
    );
}

export default DomainMembersReportSuspiciousActivity;
