import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import BulletList from '@components/BulletList';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
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
    const {inputCallbackRef} = useAutoFocusInput();
    const RULE_EXAMPLE_BULLET_POINTS = [
        translate('workspace.rules.expenseReportRules.customNameEmailPhoneExample'),
        translate('workspace.rules.expenseReportRules.customNameStartDateExample'),
        translate('workspace.rules.expenseReportRules.customNameWorkspaceNameExample'),
        translate('workspace.rules.expenseReportRules.customNameReportIDExample'),
        translate('workspace.rules.expenseReportRules.customNameTotalExample'),
    ] as const satisfies string[];

    const fieldListItem = policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE];
    const customNameDefaultValue = Str.htmlDecode(fieldListItem?.defaultValue ?? '');

    const validateCustomName = useCallback(
        ({defaultTitle}: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORTS_DEFAULT_TITLE_MODAL_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REPORTS_DEFAULT_TITLE_MODAL_FORM> = {};
            if (!defaultTitle) {
                errors[INPUT_IDS.DEFAULT_TITLE] = translate('common.error.fieldRequired');
            } else if (defaultTitle.length > CONST.WORKSPACE_NAME_CHARACTER_LIMIT) {
                errors[INPUT_IDS.DEFAULT_TITLE] = translate('common.error.characterLimitExceedCounter', {
                    length: defaultTitle.length,
                    limit: CONST.WORKSPACE_NAME_CHARACTER_LIMIT,
                });
            }
            return errors;
        },
        [translate],
    );

    const clearTitleFieldError = () => {
        clearPolicyTitleFieldError(policyID);
    };

    // Get pending action for loading state
    const isLoading = !!policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]?.pendingFields?.defaultValue;

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
                testID={ReportsDefaultTitlePage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.expenseReportRules.customNameTitle')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={[styles.ph5, styles.pb4]}>
                    <Text>
                        {translate('workspace.rules.expenseReportRules.customNameDescription')}
                        <TextLink
                            style={[styles.link]}
                            href={CONST.CUSTOM_REPORT_NAME_HELP_URL}
                        >
                            {translate('workspace.rules.expenseReportRules.customNameDescriptionLink')}
                        </TextLink>
                        .
                    </Text>
                </View>
                <FormProvider
                    style={[styles.flexGrow1, styles.mh5]}
                    formID={ONYXKEYS.FORMS.REPORTS_DEFAULT_TITLE_MODAL_FORM}
                    validate={validateCustomName}
                    onSubmit={submitForm}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    isLoading={isLoading}
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
                            inputID={INPUT_IDS.DEFAULT_TITLE}
                            defaultValue={customNameDefaultValue}
                            label={translate('workspace.rules.expenseReportRules.customNameInputLabel')}
                            aria-label={translate('workspace.rules.expenseReportRules.customNameInputLabel')}
                            ref={inputCallbackRef}
                        />
                    </OfflineWithFeedback>
                    <BulletList
                        items={RULE_EXAMPLE_BULLET_POINTS}
                        header={translate('workspace.rules.expenseReportRules.examples')}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ReportsDefaultTitlePage.displayName = 'ReportsDefaultTitlePage';

export default ReportsDefaultTitlePage;
