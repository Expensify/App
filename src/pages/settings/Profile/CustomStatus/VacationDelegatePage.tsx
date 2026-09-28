import BaseVacationDelegateSelectionComponent from '@components/BaseVacationDelegateSelectionComponent';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {setDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {VacationDelegateForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/VacationDelegateForm';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

const draftDelegateSelector = (draft: OnyxEntry<VacationDelegateForm>) => draft?.[INPUT_IDS.DELEGATE];

function VacationDelegatePage() {
    const {translate} = useLocalize();

    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
    const [draftDelegate] = useOnyx(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM_DRAFT, {selector: draftDelegateSelector});

    const onSelectRow = (option: Participant) => {
        if (!option?.login) {
            return;
        }

        // The pick is only saved from the form, where the clear after date is chosen too.
        setDraftValues(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM, {[INPUT_IDS.DELEGATE]: option.login});
        Navigation.goBack(ROUTES.SETTINGS_VACATION_DELEGATE);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="VacationDelegatePage"
            shouldShowOfflineIndicator={false}
        >
            <BaseVacationDelegateSelectionComponent
                vacationDelegate={draftDelegate ? {...vacationDelegate, delegate: draftDelegate} : vacationDelegate}
                onSelectRow={onSelectRow}
                headerTitle={translate('common.vacationDelegate')}
                onBackButtonPress={() => Navigation.goBack()}
                cannotSetDelegateMessage={translate('statusPage.cannotSetVacationDelegate')}
                includeCurrentUser={false}
            />
        </ScreenWrapper>
    );
}

export default VacationDelegatePage;
