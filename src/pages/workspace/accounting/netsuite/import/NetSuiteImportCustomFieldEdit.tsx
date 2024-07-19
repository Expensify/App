import React, {useCallback, useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import ConnectionLayout from '@components/ConnectionLayout';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteCustomLists, updateNetSuiteCustomSegments} from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {NetSuiteCustomList, NetSuiteCustomSegment} from '@src/types/onyx/Policy';
import NetSuiteCustomFieldMappingPicker from './NetSuiteImportCustomFieldNew/NetSuiteCustomFieldMappingPicker';

type CustomField = NetSuiteCustomList | NetSuiteCustomSegment;
type ImportCustomFieldsKeys = ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;

type NetSuiteImportCustomFieldViewProps = WithPolicyConnectionsProps & {
    route: {
        params: {
            /** Whether the record is of type custom segment or list */
            importCustomField: ImportCustomFieldsKeys;

            /** Index of the current record */
            valueIndex: number;

            /** Selected field of the current record  */
            fieldName: string;
        };
    };
};

function NetSuiteImportCustomFieldEdit({
    policy,
    route: {
        params: {importCustomField, valueIndex, fieldName},
    },
}: NetSuiteImportCustomFieldViewProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const config = policy?.connections?.netsuite?.options?.config;
    const allRecords = useMemo(() => config?.syncOptions?.[importCustomField] ?? [], [config?.syncOptions, importCustomField]);

    const customField: CustomField | undefined = allRecords[valueIndex];
    const fieldValue = customField?.[fieldName as keyof CustomField] ?? '';

    const updateRecord = useCallback(
        (formValues: Partial<FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_FORM>>) => {
            const newValue = formValues[fieldName as keyof typeof formValues];

            if (customField) {
                const updatedRecords = allRecords.map((record, index) => {
                    if (index === Number(valueIndex)) {
                        return {
                            ...record,
                            [fieldName]: newValue,
                        };
                    }
                    return record;
                });

                if (PolicyUtils.isNetSuiteCustomSegmentRecord(customField)) {
                    updateNetSuiteCustomSegments(policyID, updatedRecords as NetSuiteCustomSegment[], allRecords as NetSuiteCustomSegment[]);
                } else {
                    updateNetSuiteCustomLists(policyID, updatedRecords as NetSuiteCustomList[], allRecords as NetSuiteCustomList[]);
                }
            }

            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_VIEW.getRoute(policyID, importCustomField, valueIndex));
        },
        [allRecords, customField, fieldName, importCustomField, policyID, valueIndex],
    );

    const validate = useCallback(
        (formValues: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_FORM> = {};

            const key = fieldName as keyof typeof formValues;
            const fieldLabel = translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.fields.${fieldName}` as TranslationPaths);
            if (!formValues[key]) {
                ErrorUtils.addErrorMessage(errors, fieldName, translate('workspace.netsuite.import.importCustomFields.requiredFieldError', fieldLabel));
            } else if (
                policy?.connections?.netsuite?.options?.config?.syncOptions?.customSegments?.find(
                    (customSegment) => customSegment?.[fieldName as keyof typeof customSegment]?.toLowerCase() === formValues[key].toLowerCase(),
                )
            ) {
                ErrorUtils.addErrorMessage(errors, fieldName, translate('workspace.netsuite.import.importCustomFields.customSegments.errors.uniqueFieldError', fieldLabel));
            }

            return errors;
        },
        [fieldName, importCustomField, policy?.connections?.netsuite?.options?.config?.syncOptions?.customSegments, translate],
    );

    const renderForm = useMemo(
        () =>
            customField && (
                <FormProvider
                    formID={ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_FORM}
                    style={[styles.flexGrow1, styles.ph5]}
                    validate={validate}
                    onSubmit={updateRecord}
                    submitButtonText={translate('common.save')}
                    shouldValidateOnBlur
                    shouldValidateOnChange
                    isSubmitDisabled={!!config?.syncOptions?.pendingFields?.[importCustomField]}
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={fieldName}
                        label={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.fields.${fieldName}` as TranslationPaths)}
                        aria-label={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.fields.${fieldName}` as TranslationPaths)}
                        role={CONST.ROLE.PRESENTATION}
                        spellCheck={false}
                        defaultValue={fieldValue ?? ''}
                    />
                </FormProvider>
            ),
        [config?.syncOptions?.pendingFields, customField, fieldName, fieldValue, importCustomField, styles.flexGrow1, styles.ph5, translate, updateRecord, validate],
    );

    const renderSelection = useMemo(
        () =>
            customField && (
                <NetSuiteCustomFieldMappingPicker
                    onInputChange={(value) => {
                        updateRecord({
                            [fieldName]: value,
                        });
                    }}
                    value={fieldValue}
                />
            ),
        [customField, fieldName, fieldValue, updateRecord],
    );

    const renderMap: Record<string, JSX.Element> = {
        mapping: renderSelection,
    };

    return (
        <ConnectionLayout
            displayName={NetSuiteImportCustomFieldEdit.displayName}
            headerTitle={`workspace.netsuite.import.importCustomFields.${importCustomField}.fields.${fieldName}` as TranslationPaths}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={!customField || !PolicyUtils.isNetSuiteCustomFieldPropertyEditable(customField, fieldName)}
            shouldUseScrollView={false}
        >
            {renderMap[fieldName] || renderForm}
        </ConnectionLayout>
    );
}

NetSuiteImportCustomFieldEdit.displayName = 'NetSuiteImportCustomFieldEdit';
export default withPolicyConnections(NetSuiteImportCustomFieldEdit);
