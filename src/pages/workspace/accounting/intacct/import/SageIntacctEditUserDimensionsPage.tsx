import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import ConnectionLayout from '@components/ConnectionLayout';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearSageIntacctUserDimensionErrorField, editSageIntacctUserDimensions} from '@libs/actions/connections/SageIntacct';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/SageIntacctDimensionsForm';
import DimensionTypeSelector from './DimensionTypeSelector';

type SageIntacctEditUserDimensionPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EDIT_USER_DIMENSION>;

function SageIntacctEditUserDimensionPage({route}: SageIntacctEditUserDimensionPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const editedUserDimensionName: string = route.params.dimensionName;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID ?? '-1'}`);
    const policyID: string = policy?.id ?? '-1';
    const userDimensions = policy?.connections?.intacct?.config?.mappings?.dimensions;
    const editedUserDimension = userDimensions?.find((userDimension) => userDimension.name === editedUserDimensionName);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SAGE_INTACCT_DIMENSION_TYPE_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SAGE_INTACCT_DIMENSION_TYPE_FORM> = {};

            if (!values[INPUT_IDS.INTEGRATION_NAME]) {
                ErrorUtils.addErrorMessage(errors, INPUT_IDS.INTEGRATION_NAME, translate('common.error.fieldRequired'));
            }

            if (userDimensions?.some((userDimension) => userDimension.name === values[INPUT_IDS.INTEGRATION_NAME] && editedUserDimensionName !== values[INPUT_IDS.INTEGRATION_NAME])) {
                ErrorUtils.addErrorMessage(errors, INPUT_IDS.INTEGRATION_NAME, 'Dimension with such name already exists!'); // TODO fix name
            }

            if (!values[INPUT_IDS.DIMENSION_TYPE]) {
                ErrorUtils.addErrorMessage(errors, INPUT_IDS.DIMENSION_TYPE, translate('common.error.fieldRequired'));
            }
            return errors;
        },
        [editedUserDimensionName, translate, userDimensions],
    );

    return (
        <ConnectionLayout
            displayName={SageIntacctEditUserDimensionPage.displayName}
            headerTitleAlreadyTranslated={editedUserDimensionName}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.flex1}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.SAGE_INTACCT_DIMENSION_TYPE_FORM}
                validate={validate}
                onSubmit={(value) => {
                    editSageIntacctUserDimensions(policyID, editedUserDimensionName, value[INPUT_IDS.INTEGRATION_NAME], value[INPUT_IDS.DIMENSION_TYPE], userDimensions ?? []);
                    Navigation.goBack();
                }}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
                shouldValidateOnBlur
                shouldValidateOnChange
            >
                <OfflineWithFeedback
                    pendingAction={editedUserDimension?.pendingAction}
                    errors={editedUserDimension?.errors}
                    onClose={() => clearSageIntacctUserDimensionErrorField(policyID, userDimensions ?? [], editedUserDimensionName)}
                >
                    <View style={[styles.mb4]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.INTEGRATION_NAME}
                            label={translate('workspace.intacct.integrationName')}
                            aria-label={translate('workspace.intacct.integrationName')}
                            role={CONST.ROLE.PRESENTATION}
                            spellCheck={false}
                            defaultValue={editedUserDimensionName}
                        />
                    </View>
                    <View style={[styles.mb4]}>
                        <InputWrapper
                            InputComponent={DimensionTypeSelector}
                            inputID={INPUT_IDS.DIMENSION_TYPE}
                            aria-label="dimensionTypeSelector"
                            defaultValue={editedUserDimension?.mapping}
                        />
                    </View>
                    <View style={[styles.mhn5]}>
                        <MenuItem
                            title={translate('common.remove')}
                            icon={Expensicons.Trashcan}
                            onPress={() => setIsDeleteModalOpen(true)}
                        />
                    </View>
                </OfflineWithFeedback>
                <ConfirmModal
                    title="Remove user-defined dimension"
                    isVisible={isDeleteModalOpen}
                    onConfirm={() => {
                        setIsDeleteModalOpen(false);
                        Navigation.goBack();
                    }}
                    onCancel={() => setIsDeleteModalOpen(false)}
                    prompt="Are you sure you want to remove this user-defined dimension?"
                    confirmText={translate('common.remove')}
                    cancelText={translate('common.cancel')}
                    danger
                    shouldEnableNewFocusManagement
                />
            </FormProvider>
        </ConnectionLayout>
    );
}

SageIntacctEditUserDimensionPage.displayName = 'PolicySageIntacctEditUserDimensionPage';

export default SageIntacctEditUserDimensionPage;
