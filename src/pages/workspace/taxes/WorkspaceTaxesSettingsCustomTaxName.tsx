import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setPolicyCustomTaxName} from '@libs/actions/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
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

    const submit = ({name}: WorkspaceTaxCustomName) => {
        setPolicyCustomTaxName(policyID, name);
        Navigation.goBack(ROUTES.WORKSPACE_TAXES_SETTINGS.getRoute(policyID));
    };

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
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
                                maxLength={CONST.TAX_RATES.NAME_MAX_LENGTH}
                                multiline={false}
                                ref={inputCallbackRef}
                            />
                        </View>
                    </FormProvider>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceTaxesSettingsCustomTaxName.displayName = 'WorkspaceTaxesSettingsCustomTaxName';

export default withPolicyAndFullscreenLoading(WorkspaceTaxesSettingsCustomTaxName);
