import React from 'react';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import BaseLockAccountComponent from '@pages/settings/Security/LockAccount/LockAccountPageBase';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainReportSuspiciousActivityPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_LOCK_ACCOUNT>;

function DomainReportSuspiciousActivityPage({route}: DomainReportSuspiciousActivityPageProps) {
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
            <BaseLockAccountComponent
                testID="DomainReportSuspiciousActivityPage"
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_LOCK_ACCOUNT)}
                confirmModalPrompt={confirmModalPrompt}
                lockAccountPagePrompt={lockAccountPagePrompt}
                handleLockRequestFinish={handleLockRequestFinish}
            />
        </DomainNotFoundPageWrapper>
    );
}

export default DomainReportSuspiciousActivityPage;
