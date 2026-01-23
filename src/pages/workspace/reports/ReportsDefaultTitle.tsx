import {Str} from 'expensify-common';
import React, {useCallback, useRef, useState} from 'react';
import {View} from 'react-native';
import BulletList from '@components/BulletList';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getTitleFieldWithFallback} from '@libs/ReportUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {clearPolicyTitleFieldError, setPolicyDefaultReportTitle} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/ReportsDefaultTitleModalForm';

type RulesCustomNamePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORTS_DEFAULT_TITLE>;

function ReportsDefaultTitlePage({route}: RulesCustomNamePageProps) {
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isInputInitializedRef = useRef(false);
    const RULE_EXAMPLE_BULLET_POINTS = [
        translate('workspace.reports.customNameEmailPhoneExample'),
        translate('workspace.reports.customNameStartDateExample'),
        translate('workspace.reports.customNameWorkspaceNameExample'),
        translate('workspace.reports.customNameReportIDExample'),
        translate('workspace.reports.customNameTotalExample'),
    ] as const satisfies string[];

    const titleField = getTitleFieldWithFallback(policy);

    const customNameDefaultValue = Str.htmlDecode(titleField?.defaultValue ?? '');
    const [reportTitle, setReportTitle] = useState(() => customNameDefaultValue);

    // Sync reportTitle state when titleField defaultValue changes. This is needed because:
    // 1. useState initializer only runs once on mount - if the policy loads after the component mounts,
    //    reportTitle won't update automatically even though customNameDefaultValue changes
    // 2. Edge case: If another user updates the policy title formula default value while this user has
    //    the page open, usePolicy will cause a re-render with the new defaultValue, but reportTitle
    //    state won't update without this effect
    // Only update if the current value is empty to avoid overwriting user input
    React.useEffect(() => {
        const newDefaultValue = Str.htmlDecode(titleField?.defaultValue ?? '');
        if (newDefaultValue && !reportTitle) {
            setReportTitle(newDefaultValue);
        }
    }, [titleField?.defaultValue, reportTitle]);

    const validateCustomName = useCallback(
        ({defaultTitle}: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORTS_DEFAULT_TITLE_MODAL_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REPORTS_DEFAULT_TITLE_MODAL_FORM> = {};
            if (!defaultTitle) {
                errors[INPUT_IDS.DEFAULT_TITLE] = translate('common.error.fieldRequired');
            } else if (defaultTitle.length > CONST.REPORT_TITLE_FORMULA_LIMIT) {
                errors[INPUT_IDS.DEFAULT_TITLE] = translate('common.error.characterLimitExceedCounter', defaultTitle.length, CONST.REPORT_TITLE_FORMULA_LIMIT);
            }
            return errors;
        },
        [translate],
    );

    const clearTitleFieldError = () => {
        clearPolicyTitleFieldError(policyID);
    };

    // Clear errors when modal is dismissed
    useBeforeRemove(() => {
        clearTitleFieldError();
    });

    const submitForm = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORTS_DEFAULT_TITLE_MODAL_FORM>) => {
        setPolicyDefaultReportTitle(policyID, values.defaultTitle);
        Navigation.goBack();
    };

    const titleError = policy?.errorFields?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE];
    const titleFieldError = getLatestErrorField({errorFields: titleError ?? {}}, 'defaultValue');

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="ReportsDefaultTitlePage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.reports.customNameTitle')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={[styles.renderHTML, styles.flexRow, styles.ph5, styles.pb4]}>
                    <RenderHTML html={translate('workspace.reports.customNameDescription')} />
                </View>
                <FormProvider
                    style={[styles.flexGrow1, styles.mh5]}
                    formID={ONYXKEYS.FORMS.REPORTS_DEFAULT_TITLE_MODAL_FORM}
                    validate={validateCustomName}
                    onSubmit={submitForm}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <OfflineWithFeedback
                        pendingAction={policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]?.pendingFields?.defaultValue}
                        errors={titleFieldError}
                        errorRowStyles={styles.mh0}
                        onClose={clearTitleFieldError}
                    >
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID={INPUT_IDS.DEFAULT_TITLE}
                            defaultValue={customNameDefaultValue}
                            label={translate('workspace.reports.customNameInputLabel')}
                            aria-label={translate('workspace.reports.customNameInputLabel')}
                            maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                            value={reportTitle}
                            spellCheck={false}
                            autoFocus
                            onChangeText={setReportTitle}
                            autoGrowHeight
                            ref={(el: BaseTextInputRef | null): void => {
                                if (!isInputInitializedRef.current) {
                                    updateMultilineInputRange(el);
                                }
                                isInputInitializedRef.current = true;
                            }}
                        />
                    </OfflineWithFeedback>
                    <BulletList
                        items={RULE_EXAMPLE_BULLET_POINTS}
                        header={translate('workspace.reports.reportsCustomTitleExamples')}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default ReportsDefaultTitlePage;
