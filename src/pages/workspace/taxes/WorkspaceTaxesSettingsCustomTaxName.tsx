import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as ValidationUtils from '@libs/ValidationUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {setPolicyCustomTaxName} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceTaxCustomName';
import type {WorkspaceTaxCustomName} from '@src/types/form/WorkspaceTaxCustomName';

type WorkspaceTaxesSettingsCustomTaxNameProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAXES_SETTINGS_CUSTOM_TAX_NAME>;

function WorkspaceTaxesSettingsCustomTaxName({
    route: {
        params: {policyID},
    },
    policy,
}: WorkspaceTaxesSettingsCustomTaxNameProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAX_CUSTOM_NAME>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_TAX_CUSTOM_NAME> = {};
            const customTaxName = values[INPUT_IDS.NAME];

            if (!ValidationUtils.isRequiredFulfilled(customTaxName)) {
                errors.name = translate('workspace.taxes.error.customNameRequired');
            }

            return errors;
        },
        [translate],
    );

    const submit = ({name}: WorkspaceTaxCustomName) => {
        setPolicyCustomTaxName(policyID, name);
        Navigation.goBack(ROUTES.WORKSPACE_TAXES_SETTINGS.getRoute(policyID));
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={WorkspaceTaxesSettingsCustomTaxName.displayName}
                style={styles.defaultModalContainer}
            >
                <HeaderWithBackButton title={translate('workspace.taxes.customTaxName')} />

                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_TAX_CUSTOM_NAME}
                    submitButtonText={translate('workspace.editor.save')}
                    style={[styles.flexGrow1, styles.ph5]}
                    scrollContextEnabled
                    enabledWhenOffline
                    validate={validate}
                    onSubmit={submit}
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID={INPUT_IDS.NAME}
                            label={translate('workspace.editor.nameInputLabel')}
                            accessibilityLabel={translate('workspace.editor.nameInputLabel')}
                            defaultValue={policy?.taxRates?.name}
                            maxLength={CONST.TAX_RATES.CUSTOM_NAME_MAX_LENGTH}
                            multiline={false}
                            ref={inputCallbackRef}
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceTaxesSettingsCustomTaxName.displayName = 'WorkspaceTaxesSettingsCustomTaxName';

export default withPolicyAndFullscreenLoading(WorkspaceTaxesSettingsCustomTaxName);
