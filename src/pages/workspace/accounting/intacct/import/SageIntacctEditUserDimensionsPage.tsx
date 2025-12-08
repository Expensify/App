import React, {useCallback} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import TextInput from '@components/TextInput';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    clearSageIntacctErrorField,
    clearSageIntacctPendingField,
    editSageIntacctUserDimensions,
    removeSageIntacctUserDimensions,
    removeSageIntacctUserDimensionsByName,
} from '@libs/actions/connections/SageIntacct';
import {addErrorMessage, getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/SageIntacctDimensionsForm';
import DimensionTypeSelector from './DimensionTypeSelector';

type SageIntacctEditUserDimensionsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EDIT_USER_DIMENSION>;

function SageIntacctEditUserDimensionsPage({route}: SageIntacctEditUserDimensionsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const editedUserDimensionName: string = route.params.dimensionName;
    const policy = usePolicy(route.params.policyID);
    const policyID: string = policy?.id ?? `${CONST.DEFAULT_NUMBER_ID}`;
    const config = policy?.connections?.intacct?.config;
    const userDimensions = policy?.connections?.intacct?.config?.mappings?.dimensions;
    const editedUserDimension = userDimensions?.find((userDimension) => userDimension.dimension === editedUserDimensionName);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SAGE_INTACCT_DIMENSION_TYPE_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SAGE_INTACCT_DIMENSION_TYPE_FORM> = {};

            if (!values[INPUT_IDS.INTEGRATION_NAME]) {
                addErrorMessage(errors, INPUT_IDS.INTEGRATION_NAME, translate('common.error.fieldRequired'));
            }

            if (userDimensions?.some((userDimension) => userDimension.dimension === values[INPUT_IDS.INTEGRATION_NAME] && editedUserDimensionName !== values[INPUT_IDS.INTEGRATION_NAME])) {
                addErrorMessage(errors, INPUT_IDS.INTEGRATION_NAME, translate('workspace.intacct.dimensionExists'));
            }

            if (!values[INPUT_IDS.DIMENSION_TYPE]) {
                addErrorMessage(errors, INPUT_IDS.DIMENSION_TYPE, translate('common.error.fieldRequired'));
            }
            return errors;
        },
        [editedUserDimensionName, translate, userDimensions],
    );

    return (
        <ConnectionLayout
            displayName={SageIntacctEditUserDimensionsPage.displayName}
            headerTitleAlreadyTranslated={editedUserDimensionName}
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
                    editSageIntacctUserDimensions(policyID, editedUserDimensionName, value[INPUT_IDS.INTEGRATION_NAME], value[INPUT_IDS.DIMENSION_TYPE], userDimensions ?? []);
                    Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_USER_DIMENSIONS.getRoute(policyID));
                }}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
                shouldValidateOnBlur
                shouldValidateOnChange
            >
                <OfflineWithFeedback
                    pendingAction={settingsPendingAction([`${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${editedUserDimensionName}`], config?.pendingFields)}
                    errors={getLatestErrorField(config ?? {}, `${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${editedUserDimensionName}`)}
                    errorRowStyles={[styles.pb3]}
                    onClose={() => {
                        clearSageIntacctErrorField(policyID, `${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${editedUserDimensionName}`);
                        const pendingAction = settingsPendingAction([`${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${editedUserDimensionName}`], config?.pendingFields);
                        if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
                            removeSageIntacctUserDimensionsByName(userDimensions ?? [], policyID, editedUserDimensionName);
                            Navigation.goBack();
                        }
                        clearSageIntacctPendingField(policyID, `${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${editedUserDimensionName}`);
                    }}
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
                    <View style={[]}>
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
                            onPress={async () => {
                                const result = await showConfirmModal({
                                    title: translate('workspace.intacct.removeDimension'),
                                    prompt: translate('workspace.intacct.removeDimensionPrompt'),
                                    confirmText: translate('common.remove'),
                                    cancelText: translate('common.cancel'),
                                    danger: true,
                                    shouldEnableNewFocusManagement: true,
                                });

                                if (result.action === ModalActions.CONFIRM) {
                                    removeSageIntacctUserDimensions(policyID, editedUserDimensionName, userDimensions ?? []);
                                    Navigation.goBack();
                                }
                            }}
                        />
                    </View>
                </OfflineWithFeedback>
            </FormProvider>
        </ConnectionLayout>
    );
}

SageIntacctEditUserDimensionsPage.displayName = 'SageIntacctEditUserDimensionsPage';

export default SageIntacctEditUserDimensionsPage;
