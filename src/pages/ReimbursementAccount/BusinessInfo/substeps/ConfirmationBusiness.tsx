import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import React, {useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FormProvider from '@components/Form/FormProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {ReimbursementAccount, ReimbursementAccountDraft} from '@src/types/onyx';
import {FormValues} from '@src/types/onyx/Form';
import * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type ConfirmationBusinessOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountDraft>;
};

type ConfirmationBusinessProps = ConfirmationBusinessOnyxProps & SubStepProps;

type States = keyof typeof COMMON_CONST.STATES;

const businessInfoStepKeys = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY;

const validate = (values: FormValues): OnyxCommon.Errors => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, [businessInfoStepKeys.HAS_NO_CONNECTION_TO_CANNABIS]);

    if (!values.hasNoConnectionToCannabis) {
        errors.hasNoConnectionToCannabis = 'bankAccount.error.restrictedBusiness';
    }

    return errors;
};

function ConfirmationBusiness({reimbursementAccount, reimbursementAccountDraft, onNext, onMove}: ConfirmationBusinessProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const values = useMemo(() => getSubstepValues(businessInfoStepKeys, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const error = ErrorUtils.getLatestErrorMessage(reimbursementAccount ?? {});

    const defaultCheckboxState = reimbursementAccountDraft?.[businessInfoStepKeys.HAS_NO_CONNECTION_TO_CANNABIS] ?? false;

    return (
        // @ts-expect-error TODO: Remove this once ScreenWrapper (https://github.com/Expensify/App/issues/25128) is migrated to TypeScript
        <ScreenWrapper
            testID={ConfirmationBusiness.displayName}
            style={[styles.pt0]}
            scrollEnabled
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <Text style={[styles.textHeadline, styles.ph5, styles.mb0]}>{translate('businessInfoStep.letsDoubleCheck')}</Text>
                <MenuItemWithTopDescription
                    description={translate('businessInfoStep.businessName')}
                    title={values[businessInfoStepKeys.COMPANY_NAME]}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(0);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('businessInfoStep.taxIDNumber')}
                    title={values[businessInfoStepKeys.COMPANY_TAX_ID]}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(1);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('common.companyAddress')}
                    title={`${values[businessInfoStepKeys.STREET]}, ${values[businessInfoStepKeys.CITY]}, ${values[businessInfoStepKeys.STATE]} ${values[businessInfoStepKeys.ZIP_CODE]}`}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(4);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('common.phoneNumber')}
                    title={values[businessInfoStepKeys.COMPANY_PHONE]}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(3);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('businessInfoStep.companyWebsite')}
                    title={values[businessInfoStepKeys.COMPANY_WEBSITE]}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(2);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('businessInfoStep.companyType')}
                    title={values[businessInfoStepKeys.INCORPORATION_TYPE]}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(5);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('businessInfoStep.incorporationDate')}
                    title={values[businessInfoStepKeys.INCORPORATION_DATE]}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(6);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('businessInfoStep.incorporationState')}
                    title={translate(`allStates.${values[businessInfoStepKeys.INCORPORATION_STATE] as States}.stateName`)}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(7);
                    }}
                />
                {/* @ts-expect-error TODO: Remove this once Form (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript */}
                <FormProvider
                    formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                    validate={validate}
                    onSubmit={onNext}
                    scrollContextEnabled
                    submitButtonText={translate('common.confirm')}
                    style={[styles.mh5, styles.flexGrow1]}
                >
                    <CheckboxWithLabel
                        aria-label={`${translate('businessInfoStep.confirmCompanyIsNot')} ${translate('businessInfoStep.listOfRestrictedBusinesses')}`}
                        inputID={businessInfoStepKeys.HAS_NO_CONNECTION_TO_CANNABIS}
                        defaultValue={defaultCheckboxState}
                        LabelComponent={() => (
                            <Text>
                                {`${translate('businessInfoStep.confirmCompanyIsNot')} `}
                                <TextLink
                                    // eslint-disable-next-line max-len
                                    href={CONST.LIST_OF_RESTRICTED_BUSINESSES}
                                >
                                    {`${translate('businessInfoStep.listOfRestrictedBusinesses')}.`}
                                </TextLink>
                            </Text>
                        )}
                        style={[styles.mt4]}
                        shouldSaveDraft
                        onInputChange={() => {}}
                    />
                </FormProvider>
                <View style={[styles.ph5, styles.mtAuto]}>
                    {error.length > 0 && (
                        <DotIndicatorMessage
                            textStyles={[styles.formError]}
                            type="error"
                            messages={{error}}
                        />
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

ConfirmationBusiness.displayName = 'ConfirmationBusiness';

export default withOnyx<ConfirmationBusinessProps, ConfirmationBusinessOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(ConfirmationBusiness);
