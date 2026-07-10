import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateLegalName} from '@libs/actions/PersonalDetails';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';

import {validateLegalName} from '@pages/settings/Profile/PersonalDetails/BaseLegalNamePage';
import type {EnableTravelSubPageProps} from '@pages/Travel/EnableTravel/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

import React from 'react';
import {View} from 'react-native';

function LegalNameStep({onNext}: EnableTravelSubPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT);

    const legalFirstName = draftValues?.[INPUT_IDS.LEGAL_FIRST_NAME] ?? privatePersonalDetails?.[INPUT_IDS.LEGAL_FIRST_NAME] ?? '';
    const legalLastName = draftValues?.[INPUT_IDS.LEGAL_LAST_NAME] ?? privatePersonalDetails?.[INPUT_IDS.LEGAL_LAST_NAME] ?? '';

    const handleSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>) => {
        // shouldGoBack is false because updateLegalName normally drives a standalone "edit legal name" page that
        // navigates back on save; this step drives its own forward navigation via onNext below. Without this,
        // updateLegalName's own goBack() and onNext()'s forward push raced in the same tick, producing a visible flash.
        updateLegalName(values.legalFirstName?.trim() ?? '', values.legalLastName?.trim() ?? '', formatPhoneNumber, currentUserPersonalDetails, false);
        onNext();
    };

    return (
        <FormProvider
            style={[styles.flexGrow1, styles.ph5]}
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            validate={validateLegalName}
            onSubmit={handleSubmit}
            submitButtonText={translate('common.next')}
            enabledWhenOffline
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('privatePersonalDetails.enterLegalName')}</Text>
            <Text style={[styles.textSupporting, styles.mb6]}>{translate('workspace.moreFeatures.travel.personalDetailsDescription')}</Text>
            <View style={[styles.mb4]}>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.LEGAL_FIRST_NAME}
                    name="legalFirstName"
                    label={translate('privatePersonalDetails.legalFirstName')}
                    aria-label={translate('privatePersonalDetails.legalFirstName')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={legalFirstName}
                    shouldSaveDraft
                    spellCheck={false}
                    autoCapitalize="words"
                    autoComplete="given-name"
                />
            </View>
            <View>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.LEGAL_LAST_NAME}
                    name="legalLastName"
                    label={translate('privatePersonalDetails.legalLastName')}
                    aria-label={translate('privatePersonalDetails.legalLastName')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={legalLastName}
                    shouldSaveDraft
                    spellCheck={false}
                    autoCapitalize="words"
                    autoComplete="family-name"
                />
            </View>
        </FormProvider>
    );
}

export default LegalNameStep;
