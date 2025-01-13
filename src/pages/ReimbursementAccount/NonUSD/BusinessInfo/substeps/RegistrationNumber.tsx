import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type RegistrationNumberProps = SubStepProps;

const {BUSINESS_REGISTRATION_INCORPORATION_NUMBER, COMPANY_COUNTRY_CODE} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [BUSINESS_REGISTRATION_INCORPORATION_NUMBER];

function RegistrationNumber({onNext, isEditing}: RegistrationNumberProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const defaultValue =
        reimbursementAccount?.achData?.additionalData?.corpay?.[BUSINESS_REGISTRATION_INCORPORATION_NUMBER] ?? reimbursementAccountDraft?.[BUSINESS_REGISTRATION_INCORPORATION_NUMBER] ?? '';
    const businessStepCountryDraftValue = reimbursementAccount?.achData?.additionalData?.corpay?.[COMPANY_COUNTRY_CODE] ?? reimbursementAccountDraft?.[COMPANY_COUNTRY_CODE] ?? '';

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

            if (
                values[BUSINESS_REGISTRATION_INCORPORATION_NUMBER] &&
                !ValidationUtils.isValidRegistrationNumber(values[BUSINESS_REGISTRATION_INCORPORATION_NUMBER], businessStepCountryDraftValue)
            ) {
                errors[BUSINESS_REGISTRATION_INCORPORATION_NUMBER] = translate('businessInfoStep.error.registrationNumber');
            }

            return errors;
        },
        [businessStepCountryDraftValue, translate],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('businessInfoStep.whatsTheBusinessRegistrationNumber')}</Text>
            <InputWrapper
                InputComponent={TextInput}
                label={translate('businessInfoStep.registrationNumber')}
                aria-label={translate('businessInfoStep.registrationNumber')}
                role={CONST.ROLE.PRESENTATION}
                inputID={BUSINESS_REGISTRATION_INCORPORATION_NUMBER}
                containerStyles={[styles.mt6]}
                defaultValue={defaultValue}
                shouldSaveDraft={!isEditing}
            />
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt6]}>
                <Icon
                    src={Expensicons.QuestionMark}
                    width={12}
                    height={12}
                    fill={theme.icon}
                />
                <View style={[styles.ml2, styles.dFlex, styles.flexRow]}>
                    <TextLink
                        style={[styles.textMicro]}
                        href={CONST.HELP_LINK_URL}
                    >
                        {translate('businessInfoStep.whatsThisNumber')}
                    </TextLink>
                </View>
            </View>
        </FormProvider>
    );
}

RegistrationNumber.displayName = 'RegistrationNumber';

export default RegistrationNumber;
