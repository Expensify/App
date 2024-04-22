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
import {createPolicyTax, getNextTaxCode, getTaxValueWithPercentage, validateTaxName, validateTaxValue} from '@libs/actions/TaxRate';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
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

    const validateForm = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM> => {
            if (!policy) {
                return {};
            }
            return {
                ...validateTaxName(policy, values),
                ...validateTaxValue(values),
            };
        },
        [policy],
    );

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <FeatureEnabledAccessOrNotFoundWrapper
                    policyID={policyID}
                    featureName={CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}
                >
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
                                validate={validateForm}
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
                                        // The default currency uses 2 decimal places, so we substract it
                                        extraDecimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES - 2}
                                        // We increase the amount max length to support the extra decimals.
                                        amountMaxLength={CONST.MAX_TAX_RATE_DECIMAL_PLACES + CONST.MAX_TAX_RATE_INTEGER_PLACES}
                                        extraSymbol={<Text style={styles.iouAmountText}>%</Text>}
                                    />
                                </View>
                            </FormProvider>
                        </View>
                    </ScreenWrapper>
                </FeatureEnabledAccessOrNotFoundWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceCreateTaxPage.displayName = 'WorkspaceCreateTaxPage';

export default withPolicyAndFullscreenLoading(WorkspaceCreateTaxPage);
