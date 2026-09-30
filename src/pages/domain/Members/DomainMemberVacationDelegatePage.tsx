import BaseVacationDelegateSelectionComponent from '@components/BaseVacationDelegateSelectionComponent';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {setDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';

import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {VacationDelegateForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/VacationDelegateForm';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import {useNavigationState} from '@react-navigation/native';
import {vacationDelegateSelector} from '@selectors/Domain';
import {personalDetailsSelector} from '@selectors/PersonalDetails';
import React from 'react';

type DomainMemberVacationDelegatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.VACATION_DELEGATE_SELECT>;

const draftDelegateSelector = (draft: OnyxEntry<VacationDelegateForm>) => draft?.[INPUT_IDS.DELEGATE];

function DomainMemberVacationDelegatePage({route}: DomainMemberVacationDelegatePageProps) {
    const {domainAccountID, accountID} = route.params;
    const {translate} = useLocalize();

    const [vacationDelegate] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: vacationDelegateSelector(accountID),
    });
    const [draftDelegate] = useOnyx(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM_DRAFT, {selector: draftDelegateSelector});
    const isFormInStack = useNavigationState((state) => state.routes.some((stackRoute) => stackRoute.name === SCREENS.DOMAIN.VACATION_DELEGATE));

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: personalDetailsSelector(accountID),
    });
    const memberLogin = personalDetails?.login;

    const onSelectRow = (option: Participant) => {
        const delegateLogin = option?.login;

        if (!memberLogin || !delegateLogin) {
            return;
        }

        // The pick is only saved from the form, where the clear after date is chosen too.
        setDraftValues(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM, {[INPUT_IDS.DELEGATE]: delegateLogin});

        // Opened from the form's delegate row, so go back to it. Opened straight from the member details page, the form comes
        // next, so push it and keep this picker under it for the form's back button.
        if (isFormInStack) {
            Navigation.goBack(ROUTES.DOMAIN_VACATION_DELEGATE.getRoute(domainAccountID, accountID));
            return;
        }
        Navigation.navigate(ROUTES.DOMAIN_VACATION_DELEGATE.getRoute(domainAccountID, accountID));
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="DomainMemberVacationDelegate"
            >
                <BaseVacationDelegateSelectionComponent
                    vacationDelegate={draftDelegate ? {...vacationDelegate, delegate: draftDelegate} : vacationDelegate}
                    headerTitle={translate('statusPage.vacationDelegate.chooseDelegate')}
                    onSelectRow={onSelectRow}
                    onBackButtonPress={() => Navigation.goBack()}
                    cannotSetDelegateMessage={translate('domain.members.cannotSetVacationDelegateForMember', memberLogin ?? '')}
                    additionalExcludeLogins={memberLogin ? {[memberLogin]: true} : undefined}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainMemberVacationDelegatePage;
