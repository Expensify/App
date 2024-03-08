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
import {createWorkspaceTax} from '@libs/actions/TaxRate';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceNewTaxForm';
import type {TaxRate} from '@src/types/onyx';

type WorkspaceNewTaxPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAXES_NEW>;

function WorkspaceNewTaxPage({
    policy,
    route: {
        params: {policyID},
    },
}: WorkspaceNewTaxPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM> => {
        const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.VALUE, INPUT_IDS.NAME]);

        const value = Number(values[INPUT_IDS.VALUE]);
        if (value > 100 || value < 0) {
            errors[INPUT_IDS.VALUE] = 'workspace.taxes.errors.value.percentageRange';
        }

        return errors;
    }, []);

    const submitForm = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM>) => {
            // get next tax id that is not present in the list
            const taxes = policy.taxRates?.taxes ?? {};
            const nextTaxID = Object.keys(taxes).length + 1;
            const taxRate = {
                ...values,
                code: `tax_${Date.now()}`,
            } satisfies TaxRate;
            createWorkspaceTax(policyID, taxRate);
            Navigation.goBack();
        },
        [policyID],
    );

    return (
        <ScreenWrapper testID={WorkspaceNewTaxPage.displayName}>
            <View style={[styles.h100, styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithBackButton title="New rate" />
                <FormProvider
                    style={[styles.flexGrow1, styles.mh5]}
                    formID={ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM}
                    onSubmit={submitForm}
                    validate={validate}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                    shouldValidateOnBlur={false}
                >
                    <View style={styles.mhn5}>
                        <InputWrapper
                            InputComponent={TextPicker}
                            inputID={INPUT_IDS.NAME}
                            description={translate('workspace.taxes.name')}
                            rightLabel={translate('common.required')}
                            accessibilityLabel={translate('workspace.editor.nameInputLabel')}
                            maxLength={CONST.TAX_RATES.NAME_MAX_LENGTH}
                            multiline={false}
                        />
                        <InputWrapper
                            InputComponent={AmountPicker}
                            inputID={INPUT_IDS.VALUE}
                            description={translate('workspace.taxes.value')}
                            rightLabel={translate('common.required')}
                            hideCurrencySymbol
                            extraSymbol={<Text style={styles.iouAmountText}>%</Text>}
                        />
                    </View>
                </FormProvider>
            </View>
        </ScreenWrapper>
    );
}

WorkspaceNewTaxPage.displayName = 'WorkspaceNewTaxPage';

export default withPolicyAndFullscreenLoading(WorkspaceNewTaxPage);
