import React from 'react';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import BaseDomainMemberDetailsComponent from '@pages/domain/BaseDomainMemberDetailsComponent';
import type {MemberDetailsMenuItem} from '@pages/domain/BaseDomainMemberDetailsComponent';
import type SCREENS from '@src/SCREENS';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type DomainMemberDetailsPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_DETAILS>;

function DomainMemberDetailsPage({route}: DomainMemberDetailsPageProps) {
    const {domainAccountID, accountID} = route.params;

    return (
        <BaseDomainMemberDetailsComponent
            domainAccountID={domainAccountID}
            accountID={accountID}
            menuItems={getEmptyArray<MemberDetailsMenuItem>()}
        />
    );
}

DomainMemberDetailsPage.displayName = 'DomainMemberDetailsPage';

export default DomainMemberDetailsPage;
