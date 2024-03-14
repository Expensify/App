import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useState} from 'react';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updatePolicyTaxValue} from '@libs/actions/TaxRate';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceTaxValueForm';

type ValuePageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAXES_VALUE>;

function ValuePage({
    route: {
        params: {policyID, taxID},
    },
    policy,
}: ValuePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentTaxRate = PolicyUtils.getTaxByID(policy, taxID);
    const [value, setValue] = useState(currentTaxRate?.value?.replace('%', ''));

    const goBack = useCallback(() => Navigation.goBack(ROUTES.WORKSPACE_TAXES_EDIT.getRoute(policyID ?? '', taxID)), [policyID, taxID]);

    // TODO: Extract it to a separate file, and use it also when creating a new tax
    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAX_VALUE_FORM>) => {
        const errors = {};

        if (Number(values.value) < 0 || Number(values.value) >= 100) {
            ErrorUtils.addErrorMessage(errors, 'value', 'Percentage must be between 0 and 100');
        }

        return errors;
    }, []);

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAX_VALUE_FORM>) => {
            updatePolicyTaxValue(policyID, taxID, Number(values.value));
            goBack();
        },
        [goBack, policyID, taxID],
    );

    if (!currentTaxRate) {
        return <NotFoundPage />;
    }

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
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
                        style={[styles.flexGrow1, styles.ph5]}
                        scrollContextEnabled
                        validate={validate}
                        onSubmit={submit}
                        enabledWhenOffline
                        disablePressOnEnter={false}
                    >
                        <InputWrapper
                            InputComponent={AmountForm}
                            inputID={INPUT_IDS.VALUE}
                            defaultValue={value}
                            onInputChange={setValue}
                            hideCurrencySymbol
                            extraSymbol={<Text style={styles.iouAmountText}>%</Text>}
                        />
                    </FormProvider>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

ValuePage.displayName = 'ValuePage';

export default withPolicyAndFullscreenLoading(ValuePage);
