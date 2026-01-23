import {memberAccountIDsSelector, memberPendingActionSelector} from '@selectors/Domain';
import React from 'react';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearDomainMemberError} from '@libs/actions/Domain';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import BaseDomainMembersPage from '@pages/domain/BaseDomainMembersPage';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainMembersPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS>;

function DomainMembersPage({route}: DomainMembersPageProps) {
    const {domainAccountID} = route.params;
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Profile']);

    const [memberIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: memberAccountIDsSelector,
    });

    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        canBeMissing: true,
    });

    const [domainPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        canBeMissing: true,
        selector: memberPendingActionSelector,
    });

    const getCustomRowProps = (accountID: number, email?: string) => {
        const errorKey = email ?? accountID;
        const errors = getLatestError(domainErrors?.memberErrors?.[errorKey]?.errors) ?? undefined;
        const pendingAction = email ? domainPendingAction?.[email] : undefined;

        return {errors, pendingAction};
    };

    return (
        <BaseDomainMembersPage
            domainAccountID={domainAccountID}
            accountIDs={memberIDs ?? []}
            headerTitle={translate('domain.members.title')}
            searchPlaceholder={translate('domain.members.findMember')}
            onSelectRow={(item) => Navigation.navigate(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, item.accountID))}
            headerIcon={illustrations.Profile}
            getCustomRowProps={getCustomRowProps}
            onDismissError={(item) => clearDomainMemberError(domainAccountID, item.accountID, item.login)}
        />
    );
}

DomainMembersPage.displayName = 'DomainMembersPage';

export default DomainMembersPage;
