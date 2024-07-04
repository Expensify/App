import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
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
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {NetSuiteCustomList, NetSuiteCustomSegment} from '@src/types/onyx/Policy';

type CustomRecord = NetSuiteCustomList | NetSuiteCustomSegment;
type ImportCustomFieldsKeys = TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;

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
        (formValues: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_FORM>) => {
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

    return (
        <ConnectionLayout
            displayName={NetSuiteImportCustomFieldEdit.displayName}
            headerTitle={`workspace.netsuite.import.importCustomFields.${importCustomField}.fields.${fieldName}` as TranslationPaths}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5, styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={!customRecord}
        >
            {customRecord && (
                <FormProvider
                    formID={ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_FORM}
                    style={styles.flexGrow1}
                    validate={validate}
                    onSubmit={updateRecord}
                    submitButtonText={translate('common.save')}
                    shouldValidateOnBlur
                    shouldValidateOnChange
                >
                    <View
                        style={styles.mb4}
                        key={fieldName}
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
                    </View>
                </FormProvider>
            )}
        </ConnectionLayout>
    );
}

NetSuiteImportCustomFieldEdit.displayName = 'NetSuiteImportCustomFieldEdit';
export default withPolicyConnections(NetSuiteImportCustomFieldEdit);
