import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import AmountPicker from '@components/AmountPicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextPicker from '@components/TextPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {createPolicyTax, getNextTaxCode, getTaxValueWithPercentage} from '@libs/actions/TaxRate';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as ValidationUtils from '@libs/ValidationUtils';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceNewTaxForm';
import type {TaxRate} from '@src/types/onyx';

type WorkspaceCreateTaxPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAX_CREATE>;

function WorkspaceCreateTaxPage({
    policy,
    route: {
        params: {policyID},
    },
}: WorkspaceCreateTaxPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.VALUE, INPUT_IDS.NAME]);

            const value = values[INPUT_IDS.VALUE];
            if (!ValidationUtils.isValidPercentage(value)) {
                errors[INPUT_IDS.VALUE] = 'workspace.taxes.errors.valuePercentageRange';
            }

            const name = values[INPUT_IDS.NAME];
            if (policy?.taxRates?.taxes && ValidationUtils.isExistingTaxName(name, policy.taxRates.taxes)) {
                errors[INPUT_IDS.NAME] = 'workspace.taxes.errors.taxRateAlreadyExists';
            }

            return errors;
        },
        [policy?.taxRates?.taxes],
    );

    const submitForm = useCallback(
        ({value, ...values}: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM>) => {
            const taxRate = {
                ...values,
                value: getTaxValueWithPercentage(value),
                code: getNextTaxCode(values[INPUT_IDS.NAME], policy?.taxRates?.taxes),
            } satisfies TaxRate;
            createPolicyTax(policyID, taxRate);
            Navigation.goBack();
        },
        [policy?.taxRates?.taxes, policyID],
    );

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <ScreenWrapper
                    testID={WorkspaceCreateTaxPage.displayName}
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                >
                    <View style={[styles.h100, styles.flex1, styles.justifyContentBetween]}>
                        <HeaderWithBackButton title={translate('workspace.taxes.addRate')} />
                        <FormProvider
                            style={[styles.flexGrow1, styles.mh5]}
                            formID={ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM}
                            onSubmit={submitForm}
                            validate={validate}
                            submitButtonText={translate('common.save')}
                            enabledWhenOffline
                            shouldValidateOnBlur={false}
                            disablePressOnEnter={false}
                        >
                            <View style={styles.mhn5}>
                                <InputWrapper
                                    InputComponent={TextPicker}
                                    inputID={INPUT_IDS.NAME}
                                    label={translate('common.name')}
                                    description={translate('common.name')}
                                    rightLabel={translate('common.required')}
                                    accessibilityLabel={translate('workspace.editor.nameInputLabel')}
                                    maxLength={CONST.TAX_RATES.NAME_MAX_LENGTH}
                                    multiline={false}
                                    role={CONST.ROLE.PRESENTATION}
                                    autoFocus
                                />
                                <InputWrapper
                                    InputComponent={AmountPicker}
                                    inputID={INPUT_IDS.VALUE}
                                    title={(v) => (v ? getTaxValueWithPercentage(v) : '')}
                                    description={translate('workspace.taxes.value')}
                                    rightLabel={translate('common.required')}
                                    hideCurrencySymbol
                                    extraSymbol={<Text style={styles.iouAmountText}>%</Text>}
                                />
                            </View>
                        </FormProvider>
                    </View>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceCreateTaxPage.displayName = 'WorkspaceCreateTaxPage';

export default withPolicyAndFullscreenLoading(WorkspaceCreateTaxPage);
