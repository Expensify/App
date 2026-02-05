import React from 'react';
import MenuItem from '@components/MenuItem';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainMemberDetailsComponent from '@pages/domain/BaseDomainMemberDetailsComponent';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainMemberDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_DETAILS>;

function DomainMemberDetailsPage({route}: DomainMemberDetailsPageProps) {
    const {domainAccountID, accountID} = route.params;
    const {translate} = useLocalize();
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true});
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {canBeMissing: true});

    const unlockDomainError = getLatestErrorMessage(domainErrors?.lockAccountErrors?.[accountID]?.errors);

    const isAccountLocked = domain?.[`${CONST.DOMAIN.EXPENSIFY_LOCKED_ACCOUNT_PREFIX}${accountID}`] ?? false;
    const {showConfirmModal} = useConfirmModal();

    const showUnlockAccountModal = () => {
        showConfirmModal({
            title: translate('lockAccountPage.unlockTitle'),
            prompt: translate('lockAccountPage.unlockDescription'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    const icons = useMemoizedLazyExpensifyIcons(['Flag', 'Unlock'] as const);

    return (
        <BaseDomainMemberDetailsComponent
            domainAccountID={domainAccountID}
            accountID={accountID}
        >
            {isAccountLocked ? (
                <MenuItem
                    key="UnlockAccount"
                    title={translate('lockAccountPage.unlockAccount')}
                    icon={icons.Unlock}
                    onPress={showUnlockAccountModal}
                    brickRoadIndicator={unlockDomainError ? 'error' : undefined}
                    errorText={unlockDomainError}
                />
            ) : (
                <MenuItem
                    key="ReportSuspiciousActivity"
                    title={translate('lockAccountPage.reportSuspiciousActivity')}
                    icon={icons.Flag}
                    onPress={() => Navigation.navigate(ROUTES.DOMAIN_LOCK_ACCOUNT.getRoute(domainAccountID, accountID))}
                    shouldShowRightIcon
                />
            )}
        </BaseDomainMemberDetailsComponent>
    );
}

DomainMemberDetailsPage.displayName = 'DomainMemberDetailsPage';

export default DomainMemberDetailsPage;
