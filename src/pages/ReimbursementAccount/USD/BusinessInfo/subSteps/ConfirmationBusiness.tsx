import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

import type {CONST as COMMON_CONST} from 'expensify-common';

import React, {useCallback, useMemo} from 'react';

type States = keyof typeof COMMON_CONST.STATES;

const BUSINESS_INFO_STEP_KEYS = INPUT_IDS.BUSINESS_INFO_STEP;
const BUSINESS_INFO_STEP_INDEXES = CONST.REIMBURSEMENT_ACCOUNT.SUBSTEP_INDEX.BUSINESS_INFO;

function ConfirmCompanyLabel() {
    const {translate} = useLocalize();

    return (
        <Text>
            {`${translate('businessInfoStep.confirmCompanyIsNot')} `}
            <TextLink href={CONST.LIST_OF_RESTRICTED_BUSINESSES}>{`${translate('businessInfoStep.listOfRestrictedBusinesses')}.`}</TextLink>
        </Text>
    );
}

function ConfirmationBusiness({onNext, onMove}: SubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = getFieldRequiredErrors(values, [BUSINESS_INFO_STEP_KEYS.HAS_NO_CONNECTION_TO_CANNABIS], translate);

            if (!values.hasNoConnectionToCannabis) {
                errors.hasNoConnectionToCannabis = translate('bankAccount.error.restrictedBusiness');
            }

            return errors;
        },
        [translate],
    );

    const values = useMemo(() => getSubStepValues(BUSINESS_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const defaultCheckboxState = reimbursementAccountDraft?.[BUSINESS_INFO_STEP_KEYS.HAS_NO_CONNECTION_TO_CANNABIS] ?? false;

    return (
        <ScrollView contentContainerStyle={styles.flexGrow1}>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('businessInfoStep.letsDoubleCheck')}</Text>
            <MenuItemField
                name={translate('businessInfoStep.businessName')}
                onPress={() => {
                    onMove(BUSINESS_INFO_STEP_INDEXES.BUSINESS_NAME);
                }}
                value={values[BUSINESS_INFO_STEP_KEYS.COMPANY_NAME]}
            />
            <MenuItemField
                name={translate('businessInfoStep.taxIDNumber')}
                onPress={() => {
                    onMove(BUSINESS_INFO_STEP_INDEXES.TAX_ID_NUMBER);
                }}
                value={values[BUSINESS_INFO_STEP_KEYS.COMPANY_TAX_ID]}
            />
            <MenuItemField
                name={translate('common.companyAddress')}
                onPress={() => {
                    onMove(BUSINESS_INFO_STEP_INDEXES.COMPANY_ADDRESS);
                }}
                value={`${values[BUSINESS_INFO_STEP_KEYS.STREET]}, ${values[BUSINESS_INFO_STEP_KEYS.CITY]}, ${values[BUSINESS_INFO_STEP_KEYS.STATE]} ${values[BUSINESS_INFO_STEP_KEYS.ZIP_CODE]}`}
            />
            <MenuItemField
                name={translate('common.phoneNumber')}
                onPress={() => {
                    onMove(BUSINESS_INFO_STEP_INDEXES.PHONE_NUMBER);
                }}
                value={values[BUSINESS_INFO_STEP_KEYS.COMPANY_PHONE]}
            />
            <MenuItemField
                name={translate('businessInfoStep.companyWebsite')}
                onPress={() => {
                    onMove(BUSINESS_INFO_STEP_INDEXES.COMPANY_WEBSITE);
                }}
                value={values[BUSINESS_INFO_STEP_KEYS.COMPANY_WEBSITE]}
            />
            <MenuItemField
                name={translate('businessInfoStep.companyType')}
                onPress={() => {
                    onMove(BUSINESS_INFO_STEP_INDEXES.COMPANY_TYPE);
                }}
                value={translate(`businessInfoStep.incorporationType.${values[BUSINESS_INFO_STEP_KEYS.INCORPORATION_TYPE]}` as TranslationPaths)}
            />
            <MenuItemField
                name={translate('businessInfoStep.incorporationDate')}
                onPress={() => {
                    onMove(BUSINESS_INFO_STEP_INDEXES.INCORPORATION_DATE);
                }}
                value={values[BUSINESS_INFO_STEP_KEYS.INCORPORATION_DATE]}
            />
            <MenuItemField
                name={translate('businessInfoStep.incorporationState')}
                onPress={() => {
                    onMove(BUSINESS_INFO_STEP_INDEXES.INCORPORATION_STATE);
                }}
                value={translate(`allStates.${values[BUSINESS_INFO_STEP_KEYS.INCORPORATION_STATE] as States}.stateName`)}
            />
            <MenuItemField
                name={translate('companyStep.industryClassificationCode')}
                onPress={() => {
                    onMove(BUSINESS_INFO_STEP_INDEXES.INCORPORATION_CODE);
                }}
                value={values[BUSINESS_INFO_STEP_KEYS.INCORPORATION_CODE]}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
                validate={validate}
                onSubmit={onNext}
                scrollContextEnabled
                submitButtonText={translate('common.confirm')}
                style={[styles.mh5, styles.flexGrow1]}
                enabledWhenOffline={false}
                shouldHideFixErrorsAlert
            >
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    aria-label={`${translate('businessInfoStep.confirmCompanyIsNot')} ${translate('businessInfoStep.listOfRestrictedBusinesses')}`}
                    inputID={BUSINESS_INFO_STEP_KEYS.HAS_NO_CONNECTION_TO_CANNABIS}
                    defaultValue={defaultCheckboxState}
                    LabelComponent={ConfirmCompanyLabel}
                    style={[styles.mt3]}
                    shouldSaveDraft
                />
            </FormProvider>
        </ScrollView>
    );
}

export default ConfirmationBusiness;
