import React from 'react';
import VacationDelegateMenuItem from '@components/VacationDelegateMenuItem';
import useOnyx from '@hooks/useOnyx';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import BaseDomainMemberDetailsComponent from '@pages/domain/BaseDomainMemberDetailsComponent';
import {clearVacationDelegateError} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import useVacationDelegate from './hooks/useVacationDelegate';

type DomainMemberDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_DETAILS>;

function DomainMemberDetailsPage({route}: DomainMemberDetailsPageProps) {
    const {domainAccountID, accountID} = route.params;
    const vacationDelegate = useVacationDelegate(domainAccountID, accountID);
    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        canBeMissing: true,
    });
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {canBeMissing: true});

    return (
        <BaseDomainMemberDetailsComponent
            domainAccountID={domainAccountID}
            accountID={accountID}
        >
            <VacationDelegateMenuItem
                vacationDelegate={vacationDelegate}
                onPress={() => Navigation.navigate(ROUTES.DOMAIN_VACATION_DELEGATE.getRoute(domainAccountID, accountID))}
                pendingAction={domainPendingActions?.member?.[accountID]?.vacationDelegate}
                errors={getLatestError(domainErrors?.memberErrors?.[accountID]?.vacationDelegateErrors)}
                onCloseError={() => clearVacationDelegateError(domainAccountID, accountID, domainPendingActions?.member?.[accountID]?.vacationDelegate)}
            />
        </BaseDomainMemberDetailsComponent>
    );
}

DomainMemberDetailsPage.displayName = 'DomainMemberDetailsPage';

export default DomainMemberDetailsPage;
