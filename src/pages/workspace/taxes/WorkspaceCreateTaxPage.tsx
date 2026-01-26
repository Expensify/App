import React from 'react';
import {View} from 'react-native';
import AmountPicker from '@components/AmountPicker';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextPicker from '@components/TextPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {createPolicyTax, getNextTaxCode, getTaxValueWithPercentage, validateTaxName, validateTaxValue} from '@libs/actions/TaxRate';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {hasAccountingConnections} from '@libs/PolicyUtils';
import {isExistingTaxName} from '@libs/ValidationUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceNewTaxForm';
import type {TaxRate} from '@src/types/onyx';

type WorkspaceCreateTaxPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAX_CREATE>;

function WorkspaceCreateTaxPage({
    policy,
    route: {
        params: {policyID},
    },
}: WorkspaceCreateTaxPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const validateTaxNameCustom = (inputID: string) => {
        return (values: Record<string, string>) => {
            const errors: Record<string, string> = {};
            const name = values[inputID];

            if (name && policy?.taxRates?.taxes && isExistingTaxName(name, policy.taxRates.taxes)) {
                errors[inputID] = translate('workspace.taxes.error.taxRateAlreadyExists');
            }

            return errors;
        };
    };

    const customValidateForName = validateTaxNameCustom(INPUT_IDS.NAME);

    const submitForm = ({value, ...values}: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM>) => {
        const taxRate = {
            ...values,
            value: getTaxValueWithPercentage(value),
            code: getNextTaxCode(values[INPUT_IDS.NAME], policy?.taxRates?.taxes),
        } satisfies TaxRate;
        createPolicyTax(policyID, taxRate);
        Navigation.goBack();
    };

    const validateForm = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM> => {
        if (!policy) {
            return {};
        }
        return {
            ...validateTaxName(policy, values, translate),
            ...validateTaxValue(values, translate),
        };
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceCreateTaxPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
            >
                <FullPageNotFoundView
                    shouldShow={hasAccountingConnections(policy)}
                    addBottomSafeAreaPadding
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
                            addBottomSafeAreaPadding
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
                                    required
                                    customValidate={customValidateForName}
                                />
                                <InputWrapper
                                    InputComponent={AmountPicker}
                                    inputID={INPUT_IDS.VALUE}
                                    title={(v) => (v ? getTaxValueWithPercentage(v) : '')}
                                    description={translate('workspace.taxes.value')}
                                    rightLabel={translate('common.required')}
                                    decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
                                    maxLength={CONST.MAX_TAX_RATE_INTEGER_PLACES}
                                    isSymbolPressable={false}
                                    symbol="%"
                                    symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX}
                                    autoGrowExtraSpace={variables.w80}
                                    autoGrowMarginSide="left"
                                    style={[styles.iouAmountTextInput, styles.textAlignRight]}
                                    containerStyle={styles.iouAmountTextInputContainer}
                                    touchableInputWrapperStyle={styles.heightUndefined}
                                />
                            </View>
                        </FormProvider>
                    </View>
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceCreateTaxPage);
