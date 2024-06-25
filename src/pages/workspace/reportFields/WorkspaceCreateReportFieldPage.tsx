import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import TextPicker from '@components/TextPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setInitialCreateReportFieldsForm} from '@libs/actions/WorkspaceReportFields';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldsForm';
import TypeSelector from './TypeSelector';

type WorkspaceCreateReportFieldPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_CREATE>;

const defaultDate = DateUtils.extractDate(new Date().toString());

function WorkspaceCreateReportFieldPage({
    // policy,
    route: {
        params: {policyID},
    },
}: WorkspaceCreateReportFieldPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const formRef = useRef<FormRef>(null);

    const submitForm = useCallback(({name, type, initialValue}: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>) => {
        // eslint-disable-next-line no-console
        console.log('submitForm', name, type, initialValue);

        Navigation.goBack();
    }, []);

    const validateForm = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM> = {};

        // TODO: Add validation logic here
        // eslint-disable-next-line no-console
        console.log('validateForm', values);

        return errors;
    }, []);

    useEffect(() => {
        setInitialCreateReportFieldsForm();
    }, []);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={WorkspaceCreateReportFieldPage.displayName}
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
                    disablePressOnEnter={false}
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

                            {inputValues[INPUT_IDS.TYPE] === CONST.REPORT_FIELD_TYPES.LIST && (
                                <MenuItemWithTopDescription
                                    description={translate('common.listValues')}
                                    shouldShowRightIcon
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELD_LIST_VALUES.getRoute(policyID))}
                                />
                            )}
                        </View>
                    )}
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCreateReportFieldPage.displayName = 'WorkspaceCreateReportFieldPage';

export default withPolicyAndFullscreenLoading(WorkspaceCreateReportFieldPage);
