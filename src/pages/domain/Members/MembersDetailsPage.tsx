import React, {useMemo} from 'react';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import BaseDomainMemberDetailsComponent from '@pages/domain/BaseDomainMemberDetailsComponent';
import type {MemberDetailsMenuItem} from '@pages/domain/BaseDomainMemberDetailsComponent';
import type SCREENS from '@src/SCREENS';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type DomainMemberDetailsPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_DETAILS>;

function DomainMemberDetailsPage({route}: DomainMemberDetailsPageProps) {
    const {domainAccountID, accountID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const menuItems = useMemo(() => {
        return getEmptyArray<MemberDetailsMenuItem>();
    }, []);

    return (
        <BaseDomainMemberDetailsComponent
            domainAccountID={domainAccountID}
            accountID={accountID}
            menuItems={menuItems}
            actionButton={
                <Button
                    text={translate('domain.members.closeAccount')}
                    onPress={() => {}}
                    isDisabled
                    icon={Expensicons.ClosedSign}
                    style={styles.mb5}
                />
            }
        />
    );
}

DomainMemberDetailsPage.displayName = 'DomainMemberDetailsPage';

export default DomainMemberDetailsPage;
