import React, {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import BaseVacationDelegateSelectionComponent from '@components/BaseVacationDelegateSelectionComponent';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Domain} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

type DomainMemberVacationDelegatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.VACATION_DELEGATE>;

function DomainMemberVacationDelegatePage({route}: DomainMemberVacationDelegatePageProps) {
    const {domainAccountID, accountID} = route.params;
    const {translate} = useLocalize();

    // eslint-disable-next-line rulesdir/no-inline-useOnyx-selector
    const [vacationDelegate] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: (domain: OnyxEntry<Domain>) => domain?.[`${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${String(accountID)}` as const]?.delegate,
    });

    const onSelectRow = useCallback((option: Participant) => {
        // TODO: Implement logic for new vacation delegate selection
        console.debug('Selected option:', option);
    }, []);

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID={DomainMemberVacationDelegatePage.displayName}
            >
                <BaseVacationDelegateSelectionComponent
                    currentVacationDelegate={vacationDelegate}
                    onSelectRow={onSelectRow}
                    headerTitle={translate('domain.common.vacationDelegate')}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

DomainMemberVacationDelegatePage.displayName = 'DomainMemberVacationDelegate';

export default DomainMemberVacationDelegatePage;
