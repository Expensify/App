import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {setPolicyTaxCode, validateTaxCode} from '@libs/actions/TaxRate';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceTaxCodeForm';

type WorkspaceTaxCodePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAX_CODE>;

function WorkspaceTaxCodePage({route}: WorkspaceTaxCodePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params.policyID ?? '-1';
    const currentTaxCode = route.params.taxID;

    const policy = usePolicy(policyID);
    const {inputCallbackRef} = useAutoFocusInput();

    const setTaxCode = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAX_CODE_FORM>) => {
            const newTaxCode = values.taxCode.trim();
            if (currentTaxCode === newTaxCode) {
                Navigation.goBack(ROUTES.WORKSPACE_TAX_EDIT.getRoute(policyID, currentTaxCode));
                return;
            }

            setPolicyTaxCode(policyID, currentTaxCode, newTaxCode);
            Navigation.goBack(ROUTES.WORKSPACE_TAX_EDIT.getRoute(policyID, currentTaxCode));
        },
        [currentTaxCode, policyID],
    );

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAX_CODE_FORM>) => {
            if (!policy) {
                return {};
            }
            const newTaxCode = values.taxCode.trim();
            if (newTaxCode === currentTaxCode) {
                return {};
            }

            return validateTaxCode(policy, values);
        },
        [currentTaxCode, policy],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={WorkspaceTaxCodePage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.taxes.taxCode')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_TAX_EDIT.getRoute(policyID, currentTaxCode))}
                />

                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_TAX_CODE_FORM}
                    submitButtonText={translate('workspace.editor.save')}
                    style={[styles.flexGrow1, styles.ph5]}
                    onSubmit={setTaxCode}
                    enabledWhenOffline
                    validate={validate}
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID={INPUT_IDS.TAX_CODE}
                            label={translate('workspace.taxes.taxCode')}
                            accessibilityLabel={translate('workspace.taxes.taxCode')}
                            defaultValue={currentTaxCode}
                            maxLength={CONST.TAX_RATES.NAME_MAX_LENGTH}
                            ref={inputCallbackRef}
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceTaxCodePage.displayName = 'WorkspaceTaxCodePage';

export default WorkspaceTaxCodePage;
