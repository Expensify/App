import React from 'react';
import RenderHTML from '@components/RenderHTML';
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
import {domainNameSelector} from '@src/selectors/Domain';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';

type DomainReportSuspiciousActivityPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_LOCK_ACCOUNT>;

function DomainReportSuspiciousActivityPage({route}: DomainReportSuspiciousActivityPageProps) {
    const {domainAccountID, accountID} = route.params;

    const [memberLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(accountID)});
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});

    const {translate} = useLocalize();

    const confirmModalPrompt = translate('domain.members.reportSuspiciousActivityConfirmationPrompt');

    const lockAccountPagePrompt = <RenderHTML html={translate('domain.members.reportSuspiciousActivityPrompt', memberLogin ?? '')} />;

    const handleLockRequestFinish = () => Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID));

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <LockAccountPageBase
                testID="DomainReportSuspiciousActivityPage"
                onBackButtonPress={handleLockRequestFinish}
                confirmModalPrompt={confirmModalPrompt}
                lockAccountPagePrompt={lockAccountPagePrompt}
                handleLockRequestFinish={handleLockRequestFinish}
                accountID={accountID}
                domainAccountID={domainAccountID}
                domainName={domainName}
            />
        </DomainNotFoundPageWrapper>
    );
}

export default DomainReportSuspiciousActivityPage;
