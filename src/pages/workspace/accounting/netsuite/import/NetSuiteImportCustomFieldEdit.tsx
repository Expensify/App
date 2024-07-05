import React, {useCallback, useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import ConnectionLayout from '@components/ConnectionLayout';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteCustomLists, updateNetSuiteCustomSegments} from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {NetSuiteCustomList, NetSuiteCustomSegment} from '@src/types/onyx/Policy';

type CustomRecord = NetSuiteCustomList | NetSuiteCustomSegment;
type ImportCustomFieldsKeys = ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;
type ImportListItem = SelectorType & {
    value: ValueOf<typeof CONST.INTEGRATION_ENTITY_MAP_TYPES>;
};

type NetSuiteImportCustomFieldViewProps = WithPolicyConnectionsProps & {
    route: {
        params: {
            importCustomField: ImportCustomFieldsKeys;
            internalID: string;
            fieldName: string;
        };
    };
};

function NetSuiteImportCustomFieldEdit({
    policy,
    route: {
        params: {importCustomField, internalID, fieldName},
    },
}: NetSuiteImportCustomFieldViewProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const config = policy?.connections?.netsuite?.options?.config;
    const allRecords = useMemo(() => config?.syncOptions?.[importCustomField] ?? [], [config?.syncOptions, importCustomField]);

    const customRecord: CustomRecord | undefined = allRecords.find((record) => record.internalID === internalID);
    const fieldValue = customRecord?.[fieldName as keyof CustomRecord] ?? '';

    const updateRecord = useCallback(
        (formValues: Partial<FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_FORM>>) => {
            const newValue = formValues[fieldName as keyof typeof formValues];

            if (customRecord) {
                const updatedRecords = allRecords.map((record) => {
                    if (record.internalID === internalID) {
                        return {
                            ...record,
                            [fieldName]: newValue,
                        };
                    }
                    return record;
                });

                if ('segmentName' in customRecord) {
                    updateNetSuiteCustomSegments(policyID, updatedRecords as NetSuiteCustomSegment[], allRecords as NetSuiteCustomSegment[]);
                } else {
                    updateNetSuiteCustomLists(policyID, updatedRecords as NetSuiteCustomList[], allRecords as NetSuiteCustomList[]);
                }
            }

            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_VIEW.getRoute(policyID, importCustomField, internalID));
        },
        [allRecords, customRecord, fieldName, importCustomField, internalID, policyID],
    );

    const validate = useCallback(
        (formValues: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_FORM> = {};

            const key = fieldName as keyof typeof formValues;
            if (!formValues[key]) {
                ErrorUtils.addErrorMessage(errors, fieldName, translate('common.error.fieldRequired'));
            }

            return errors;
        },
        [fieldName, translate],
    );

    const renderForm = useMemo(
        () =>
            customRecord && (
                <FormProvider
                    formID={ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_FORM}
                    style={[styles.flexGrow1, styles.ph5]}
                    validate={validate}
                    onSubmit={updateRecord}
                    submitButtonText={translate('common.save')}
                    shouldValidateOnBlur
                    shouldValidateOnChange
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
        [customRecord, fieldName, fieldValue, importCustomField, styles.flexGrow1, styles.ph5, translate, updateRecord, validate],
    );

    const renderSelection = useMemo(() => {
        const options = [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD];

        const selectionData: ImportListItem[] =
            options.map((option) => ({
                text: translate(`workspace.netsuite.import.importTypes.${option}.label`),
                keyForList: option,
                isSelected: fieldValue === option,
                value: option,
                alternateText: translate(`workspace.netsuite.import.importTypes.${option}.description`),
            })) ?? [];

        return (
            customRecord && (
                <SelectionList
                    onSelectRow={(selected: ImportListItem) =>
                        updateRecord({
                            [fieldName]: selected.value,
                        })
                    }
                    sections={[{data: selectionData}]}
                    ListItem={RadioListItem}
                    initiallyFocusedOptionKey={selectionData?.find((record) => record.isSelected)?.keyForList}
                />
            )
        );
    }, [customRecord, fieldName, fieldValue, translate, updateRecord]);

    return (
        <ConnectionLayout
            displayName={NetSuiteImportCustomFieldEdit.displayName}
            headerTitle={`workspace.netsuite.import.importCustomFields.${importCustomField}.fields.${fieldName}` as TranslationPaths}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={!customRecord}
        >
            {fieldName === 'mapping' ? renderSelection : renderForm}
        </ConnectionLayout>
    );
}

NetSuiteImportCustomFieldEdit.displayName = 'NetSuiteImportCustomFieldEdit';
export default withPolicyConnections(NetSuiteImportCustomFieldEdit);
