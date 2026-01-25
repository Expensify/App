import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import TextPicker from '@components/TextPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {addErrorMessage} from '@libs/ErrorUtils';
import {hasCircularReferences} from '@libs/Formula';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasAccountingConnections} from '@libs/PolicyUtils';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import {hasFormulaPartsInInitialValue, isReportFieldNameExisting} from '@libs/WorkspaceReportFieldUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {createReportField, setInitialCreateReportFieldsForm} from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';
import type {Report} from '@src/types/onyx';
import InitialListValueSelector from './InitialListValueSelector';
import TypeSelector from './TypeSelector';

type CreateReportFieldsPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_CREATE>;

const defaultDate = DateUtils.extractDate(new Date().toString());

function WorkspaceCreateReportFieldsPage({
    policy,
    route: {
        params: {policyID, target},
    },
}: CreateReportFieldsPageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const formRef = useRef<FormRef>(null);
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {canBeMissing: true});

    const fieldTarget = useMemo(() => {
        if (target && Object.values(CONST.REPORT_FIELD_TARGETS).includes(target)) {
            return target;
        }

        return CONST.REPORT_FIELD_TARGETS.EXPENSE;
    }, [target]);
    const reportTypeForTarget = useMemo(() => {
        switch (fieldTarget) {
            case CONST.REPORT_FIELD_TARGETS.INVOICE:
                return CONST.REPORT.TYPE.INVOICE;
            case CONST.REPORT_FIELD_TARGETS.PAYCHECK:
                return CONST.REPORT.TYPE.PAYCHECK;
            default:
                return CONST.REPORT.TYPE.EXPENSE;
        }
    }, [fieldTarget]);

    const policyReportIDsSelector = useCallback(
        (reports: OnyxCollection<Report>) =>
            Object.values(reports ?? {})
                .filter((report) => report?.policyID === policyID && report.type === reportTypeForTarget)
                .map((report) => report?.reportID),
        [policyID, reportTypeForTarget],
    );

    const [policyReportIDs] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: true,
        selector: policyReportIDsSelector,
    });

    const availableListValuesLength = (formDraft?.[INPUT_IDS.DISABLED_LIST_VALUES] ?? []).filter((disabledListValue) => !disabledListValue).length;

    const submitForm = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>) => {
            createReportField({
                policy,
                name: values[INPUT_IDS.NAME],
                type: values[INPUT_IDS.TYPE],
                initialValue: !(values[INPUT_IDS.TYPE] === CONST.REPORT_FIELD_TYPES.LIST && availableListValuesLength === 0) ? values[INPUT_IDS.INITIAL_VALUE] : '',
                listValues: formDraft?.[INPUT_IDS.LIST_VALUES] ?? [],
                disabledListValues: formDraft?.[INPUT_IDS.DISABLED_LIST_VALUES] ?? [],
                policyReportIDs,
                target: fieldTarget,
            });
            Navigation.goBack();
        },
        [availableListValuesLength, formDraft, policy, policyReportIDs, fieldTarget],
    );

    const validateForm = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM> => {
            const {name, type, initialValue: formInitialValue} = values;
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM> = {};

            if (!isRequiredFulfilled(name)) {
                errors[INPUT_IDS.NAME] = translate('workspace.reportFields.reportFieldNameRequiredError');
            } else if (isReportFieldNameExisting(policy?.fieldList, name)) {
                errors[INPUT_IDS.NAME] = translate('workspace.reportFields.existingReportFieldNameError');
            } else if ([...name].length > CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH) {
                // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16 code units.
                addErrorMessage(errors, INPUT_IDS.NAME, translate('common.error.characterLimitExceedCounter', [...name].length, CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH));
            }

            if (!isRequiredFulfilled(type)) {
                errors[INPUT_IDS.TYPE] = translate('workspace.reportFields.reportFieldTypeRequiredError');
            }

            // formInitialValue can be undefined because the InitialValue component is rendered conditionally.
            // If it's not been rendered when the validation is executed, formInitialValue will be undefined.
            if (type === CONST.REPORT_FIELD_TYPES.TEXT && !!formInitialValue && formInitialValue.length > CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH) {
                errors[INPUT_IDS.INITIAL_VALUE] = translate('common.error.characterLimitExceedCounter', formInitialValue.length, CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH);
            }

            if ((type === CONST.REPORT_FIELD_TYPES.TEXT || type === CONST.REPORT_FIELD_TYPES.FORMULA) && hasCircularReferences(formInitialValue, name, policy?.fieldList)) {
                errors[INPUT_IDS.INITIAL_VALUE] = translate('workspace.reportFields.circularReferenceError');
            }

            if (type === CONST.REPORT_FIELD_TYPES.LIST && availableListValuesLength > 0 && !isRequiredFulfilled(formInitialValue)) {
                errors[INPUT_IDS.INITIAL_VALUE] = translate('workspace.reportFields.reportFieldInitialValueRequiredError');
            }

            return errors;
        },
        [availableListValuesLength, policy?.fieldList, translate],
    );

    const validateName = useCallback(
        (values: Record<string, string>) => {
            const errors: Record<string, string> = {};
            const name = values[INPUT_IDS.NAME];
            if (isReportFieldNameExisting(policy?.fieldList, name)) {
                errors[INPUT_IDS.NAME] = translate('workspace.reportFields.existingReportFieldNameError');
            }
            return errors;
        },
        [policy?.fieldList, translate],
    );

    const handleOnValueCommitted = useCallback(
        (inputValues: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>) => (initialValue: string) => {
            // Mirror optimisticType logic from createReportField: if user enters a formula
            // while type is Text, automatically switch the type to Formula in the form, otherwise back to Text.
            const isFormula = hasFormulaPartsInInitialValue(initialValue);
            if (isFormula) {
                formRef.current?.resetForm({
                    ...inputValues,
                    [INPUT_IDS.TYPE]: CONST.REPORT_FIELD_TYPES.FORMULA,
                    [INPUT_IDS.INITIAL_VALUE]: initialValue,
                });
            } else {
                formRef.current?.resetForm({
                    ...inputValues,
                    [INPUT_IDS.TYPE]: CONST.REPORT_FIELD_TYPES.TEXT,
                    [INPUT_IDS.INITIAL_VALUE]: initialValue,
                });
            }
        },
        [],
    );

    useEffect(() => {
        setInitialCreateReportFieldsForm();
    }, []);

    const listValues = [...(formDraft?.[INPUT_IDS.LIST_VALUES] ?? [])].sort(localeCompare).join(', ');

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            shouldBeBlocked={hasAccountingConnections(policy)}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID="WorkspaceCreateReportFieldsPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.reportFields.addField')}
                    onBackButtonPress={Navigation.goBack}
                />
                <FormProvider
                    ref={formRef}
                    style={[styles.mh5, styles.flex1]}
                    formID={ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM}
                    onSubmit={submitForm}
                    validate={validateForm}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                    shouldValidateOnBlur={false}
                    addBottomSafeAreaPadding
                >
                    {({inputValues}) => (
                        <View style={styles.mhn5}>
                            <InputWrapper
                                InputComponent={TextPicker}
                                inputID={INPUT_IDS.NAME}
                                label={translate('common.name')}
                                subtitle={translate('workspace.reportFields.nameInputSubtitle')}
                                description={translate('common.name')}
                                rightLabel={translate('common.required')}
                                accessibilityLabel={translate('workspace.editor.nameInputLabel')}
                                maxLength={CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH}
                                multiline={false}
                                role={CONST.ROLE.PRESENTATION}
                                required
                                customValidate={validateName}
                            />
                            <InputWrapper
                                InputComponent={TypeSelector}
                                inputID={INPUT_IDS.TYPE}
                                label={translate('common.type')}
                                subtitle={translate('workspace.reportFields.typeInputSubtitle')}
                                rightLabel={translate('common.required')}
                                onTypeSelected={(type) => {
                                    let initialValue;
                                    if (type === CONST.REPORT_FIELD_TYPES.DATE) {
                                        initialValue = defaultDate;
                                    } else if (type === CONST.REPORT_FIELD_TYPES.FORMULA) {
                                        initialValue = '{report:id}';
                                    } else {
                                        initialValue = '';
                                    }

                                    formRef.current?.resetForm({
                                        ...inputValues,
                                        type,
                                        initialValue,
                                    });
                                }}
                            />

                            {inputValues[INPUT_IDS.TYPE] === CONST.REPORT_FIELD_TYPES.LIST && (
                                <MenuItemWithTopDescription
                                    description={translate('workspace.reportFields.listValues')}
                                    shouldShowRightIcon
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS_LIST_VALUES.getRoute(policyID))}
                                    title={listValues}
                                    numberOfLinesTitle={5}
                                />
                            )}

                            {(inputValues[INPUT_IDS.TYPE] === CONST.REPORT_FIELD_TYPES.TEXT || inputValues[INPUT_IDS.TYPE] === CONST.REPORT_FIELD_TYPES.FORMULA) && (
                                <InputWrapper
                                    InputComponent={TextPicker}
                                    inputID={INPUT_IDS.INITIAL_VALUE}
                                    label={translate('common.initialValue')}
                                    subtitle={translate('workspace.reportFields.initialValueInputSubtitle')}
                                    description={translate('common.initialValue')}
                                    accessibilityLabel={translate('workspace.editor.initialValueInputLabel')}
                                    maxLength={CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH}
                                    multiline={false}
                                    role={CONST.ROLE.PRESENTATION}
                                    onValueCommitted={handleOnValueCommitted(inputValues)}
                                />
                            )}

                            {inputValues[INPUT_IDS.TYPE] === CONST.REPORT_FIELD_TYPES.DATE && (
                                <MenuItemWithTopDescription
                                    title={translate('common.currentDate')}
                                    description={translate('common.initialValue')}
                                    rightLabel={translate('common.required')}
                                    interactive={false}
                                />
                            )}

                            {inputValues[INPUT_IDS.TYPE] === CONST.REPORT_FIELD_TYPES.LIST && availableListValuesLength > 0 && (
                                <InputWrapper
                                    InputComponent={InitialListValueSelector}
                                    inputID={INPUT_IDS.INITIAL_VALUE}
                                    label={translate('common.initialValue')}
                                    subtitle={translate('workspace.reportFields.listValuesInputSubtitle')}
                                />
                            )}
                        </View>
                    )}
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceCreateReportFieldsPage);
