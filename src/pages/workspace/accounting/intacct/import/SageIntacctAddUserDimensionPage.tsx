import React, {useCallback} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {addSageIntacctUserDimensions} from '@libs/actions/connections/SageIntacct';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/SageIntacctDimensionsForm';
import DimensionTypeSelector from './DimensionTypeSelector';

function SageIntacctAddUserDimensionPage({policy}: WithPolicyProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id;
    const userDimensions = policy?.connections?.intacct?.config?.mappings?.dimensions;
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SAGE_INTACCT_DIMENSION_TYPE_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SAGE_INTACCT_DIMENSION_TYPE_FORM> = {};

            if (!values[INPUT_IDS.INTEGRATION_NAME]) {
                ErrorUtils.addErrorMessage(errors, INPUT_IDS.INTEGRATION_NAME, translate('common.error.fieldRequired'));
            }

            if (userDimensions?.some((userDimension) => userDimension.dimension === values[INPUT_IDS.INTEGRATION_NAME])) {
                ErrorUtils.addErrorMessage(errors, INPUT_IDS.INTEGRATION_NAME, translate('workspace.intacct.dimensionExists'));
            }

            if (!values[INPUT_IDS.DIMENSION_TYPE]) {
                ErrorUtils.addErrorMessage(errors, INPUT_IDS.DIMENSION_TYPE, translate('common.error.fieldRequired'));
            }
            return errors;
        },
        [translate, userDimensions],
    );

    return (
        <ConnectionLayout
            displayName={SageIntacctAddUserDimensionPage.displayName}
            headerTitle="workspace.intacct.addUserDefinedDimension"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.flex1}
            shouldUseScrollView={false}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_USER_DIMENSIONS.getRoute(policyID))}
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.SAGE_INTACCT_DIMENSION_TYPE_FORM}
                validate={validate}
                onSubmit={(value) => {
                    addSageIntacctUserDimensions(policyID, value[INPUT_IDS.INTEGRATION_NAME], value[INPUT_IDS.DIMENSION_TYPE], userDimensions ?? []);
                    Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_USER_DIMENSIONS.getRoute(policyID));
                }}
                submitButtonText={translate('common.confirm')}
                enabledWhenOffline
                shouldValidateOnBlur
                shouldValidateOnChange
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.INTEGRATION_NAME}
                        label={translate('workspace.intacct.integrationName')}
                        aria-label={translate('workspace.intacct.integrationName')}
                        role={CONST.ROLE.PRESENTATION}
                        spellCheck={false}
                        ref={inputCallbackRef}
                    />
                </View>
                <View>
                    <InputWrapper
                        InputComponent={DimensionTypeSelector}
                        inputID={INPUT_IDS.DIMENSION_TYPE}
                        aria-label="dimensionTypeSelector"
                    />
                </View>
            </FormProvider>
        </ConnectionLayout>
    );
}

SageIntacctAddUserDimensionPage.displayName = 'SageIntacctAddUserDimensionPage';

export default withPolicy(SageIntacctAddUserDimensionPage);
