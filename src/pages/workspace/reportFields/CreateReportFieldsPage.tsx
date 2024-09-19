import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import TextPicker from '@components/TextPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportField from '@libs/actions/Policy/ReportField';
import DateUtils from '@libs/DateUtils';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import * as ErrorUtils from '@src/libs/ErrorUtils';
import * as ValidationUtils from '@src/libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';
import InitialListValueSelector from './InitialListValueSelector';
import TypeSelector from './TypeSelector';

type CreateReportFieldsPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_CREATE>;

const defaultDate = DateUtils.extractDate(new Date().toString());

function CreateReportFieldsPage({
    policy,
    route: {
        params: {policyID},
    },
}: CreateReportFieldsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const formRef = useRef<FormRef>(null);
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);

    const availableListValuesLength = (formDraft?.[INPUT_IDS.DISABLED_LIST_VALUES] ?? []).filter((disabledListValue) => !disabledListValue).length;

    const submitForm = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>) => {
            ReportField.createReportField(policyID, {
                name: values[INPUT_IDS.NAME],
                type: values[INPUT_IDS.TYPE],
                initialValue: values[INPUT_IDS.INITIAL_VALUE],
            });
            Navigation.goBack();
        },
        [policyID],
    );

    const validateForm = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM> => {
            const {name, type} = values;
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM> = {};

            if (!ValidationUtils.isRequiredFulfilled(name)) {
                errors[INPUT_IDS.NAME] = translate('workspace.reportFields.reportFieldNameRequiredError');
            } else if (Object.values(policy?.fieldList ?? {}).some((reportField) => reportField.name === name)) {
                errors[INPUT_IDS.NAME] = translate('workspace.reportFields.existingReportFieldNameError');
            } else if ([...name].length > CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH) {
                // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16 code units.
                ErrorUtils.addErrorMessage(
                    errors,
                    INPUT_IDS.NAME,
                    translate('common.error.characterLimitExceedCounter', {length: [...name].length, limit: CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH}),
                );
            }

            if (!ValidationUtils.isRequiredFulfilled(type)) {
                errors[INPUT_IDS.TYPE] = translate('workspace.reportFields.reportFieldTypeRequiredError');
            }

            return errors;
        },
        [policy?.fieldList, translate],
    );

    useEffect(() => {
        ReportField.setInitialCreateReportFieldsForm();
    }, []);

    const [modal] = useOnyx(ONYXKEYS.MODAL);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            shouldBeBlocked={PolicyUtils.hasAccountingConnections(policy)}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={styles.defaultModalContainer}
                testID={CreateReportFieldsPage.displayName}
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
                    disablePressOnEnter={!!modal?.isVisible}
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
                            />
                            <InputWrapper
                                InputComponent={TypeSelector}
                                inputID={INPUT_IDS.TYPE}
                                label={translate('common.type')}
                                subtitle={translate('workspace.reportFields.typeInputSubtitle')}
                                rightLabel={translate('common.required')}
                                onTypeSelected={(type) => formRef.current?.resetForm({...inputValues, type, initialValue: type === CONST.REPORT_FIELD_TYPES.DATE ? defaultDate : ''})}
                            />

                            {inputValues[INPUT_IDS.TYPE] === CONST.REPORT_FIELD_TYPES.LIST && (
                                <MenuItemWithTopDescription
                                    description={translate('workspace.reportFields.listValues')}
                                    shouldShowRightIcon
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS_LIST_VALUES.getRoute(policyID))}
                                    title={formDraft?.[INPUT_IDS.LIST_VALUES]?.sort(localeCompare)?.join(', ')}
                                    numberOfLinesTitle={5}
                                />
                            )}

                            {inputValues[INPUT_IDS.TYPE] === CONST.REPORT_FIELD_TYPES.TEXT && (
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
                                />
                            )}

                            {inputValues[INPUT_IDS.TYPE] === CONST.REPORT_FIELD_TYPES.DATE && (
                                <MenuItemWithTopDescription
                                    title={translate('common.currentDate')}
                                    description={translate('common.date')}
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

CreateReportFieldsPage.displayName = 'CreateReportFieldsPage';

export default withPolicyAndFullscreenLoading(CreateReportFieldsPage);
