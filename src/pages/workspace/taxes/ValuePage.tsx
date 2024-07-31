import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updatePolicyTaxValue, validateTaxValue} from '@libs/actions/TaxRate';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceTaxValueForm';

type ValuePageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAX_VALUE>;

function ValuePage({
    route: {
        params: {policyID, taxID},
    },
    policy,
}: ValuePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const currentTaxRate = PolicyUtils.getTaxByID(policy, taxID);
    const defaultValue = currentTaxRate?.value?.replace('%', '');

    const goBack = useCallback(() => Navigation.goBack(ROUTES.WORKSPACE_TAX_EDIT.getRoute(policyID ?? '-1', taxID)), [policyID, taxID]);

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAX_VALUE_FORM>) => {
            if (defaultValue === values.value) {
                goBack();
                return;
            }
            updatePolicyTaxValue(policyID, taxID, Number(values.value));
            goBack();
        },
        [goBack, policyID, taxID, defaultValue],
    );

    if (!currentTaxRate) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={ValuePage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.taxes.value')}
                    onBackButtonPress={goBack}
                />

                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_TAX_VALUE_FORM}
                    submitButtonText={translate('workspace.editor.save')}
                    style={[styles.flexGrow1]}
                    scrollContextEnabled
                    validate={validateTaxValue}
                    onSubmit={submit}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    submitFlexEnabled={false}
                    submitButtonStyles={[styles.mh5, styles.mt0]}
                >
                    <InputWrapper
                        InputComponent={AmountForm}
                        inputID={INPUT_IDS.VALUE}
                        defaultValue={defaultValue}
                        hideCurrencySymbol
                        // The default currency uses 2 decimal places, so we substract it
                        extraDecimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES - 2}
                        // We increase the amount max length to support the extra decimals.
                        amountMaxLength={CONST.MAX_TAX_RATE_INTEGER_PLACES}
                        extraSymbol={<Text style={styles.iouAmountText}>%</Text>}
                        ref={inputCallbackRef}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ValuePage.displayName = 'ValuePage';

export default withPolicyAndFullscreenLoading(ValuePage);
