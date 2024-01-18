import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {FormValues} from '@src/types/onyx/Form';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type FullNameOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type FullNameProps = FullNameOnyxProps & SubStepProps;

const personalInfoStepKey = CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY;

const REQUIRED_FIELDS = [personalInfoStepKey.FIRST_NAME, personalInfoStepKey.LAST_NAME];

const validate = (values: FormValues): OnyxCommon.Errors => ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

function FullName({reimbursementAccount, onNext, isEditing}: FullNameProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultValues = {
        firstName: reimbursementAccount?.achData?.[personalInfoStepKey.FIRST_NAME] ?? '',
        lastName: reimbursementAccount?.achData?.[personalInfoStepKey.LAST_NAME] ?? '',
    };

    return (
        // @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
            shouldSaveDraft
        >
            <View>
                <Text style={[styles.textHeadline, styles.mb3]}>{translate('personalInfoStep.enterYourLegalFirstAndLast')}</Text>
                <View style={[styles.flex2, styles.mb5]}>
                    <InputWrapper
                        // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
                        InputComponent={TextInput}
                        inputID={personalInfoStepKey.FIRST_NAME}
                        label={translate('personalInfoStep.legalFirstName')}
                        aria-label={translate('personalInfoStep.legalFirstName')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={defaultValues.firstName}
                        shouldSaveDraft
                    />
                </View>
                <View style={[styles.flex2, styles.mb3]}>
                    <InputWrapper
                        // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
                        InputComponent={TextInput}
                        inputID={personalInfoStepKey.LAST_NAME}
                        label={translate('personalInfoStep.legalLastName')}
                        aria-label={translate('personalInfoStep.legalLastName')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={defaultValues.lastName}
                        shouldSaveDraft
                    />
                </View>
                <HelpLinks />
            </View>
        </FormProvider>
    );
}

FullName.displayName = 'FullName';

export default withOnyx<FullNameProps, FullNameOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(FullName);
