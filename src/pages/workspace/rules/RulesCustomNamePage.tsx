import React from 'react';
import {View} from 'react-native';
import BulletList from '@components/BulletList';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as PolicyActions from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/RulesCustomNameModalForm';

type RulesCustomNamePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_CUSTOM_NAME>;

function RulesCustomNamePage({route}: RulesCustomNamePageProps) {
    const policyID = route?.params?.policyID ?? '-1';
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

    const customNameDefaultValue = policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE].defaultValue;

    const validateCustomName = ({customName}: FormOnyxValues<typeof ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM> = {};
        if (!customName) {
            errors[INPUT_IDS.CUSTOM_NAME] = translate('common.error.fieldRequired');
        }
        return errors;
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            shouldBeBlocked={!policy?.shouldShowCustomReportTitleOption}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={RulesCustomNamePage.displayName}
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
                    formID={ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM}
                    validate={validateCustomName}
                    onSubmit={({customName}) => {
                        PolicyActions.setPolicyDefaultReportTitle(policyID, customName);
                        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
                    }}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.CUSTOM_NAME}
                        defaultValue={customNameDefaultValue}
                        label={translate('workspace.rules.expenseReportRules.customNameInputLabel')}
                        aria-label={translate('workspace.rules.expenseReportRules.customNameInputLabel')}
                        maxLength={CONST.WORKSPACE_NAME_CHARACTER_LIMIT}
                        ref={inputCallbackRef}
                    />
                    <BulletList
                        items={RULE_EXAMPLE_BULLET_POINTS}
                        header={translate('workspace.rules.expenseReportRules.examples')}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

RulesCustomNamePage.displayName = 'RulesCustomNamePage';

export default RulesCustomNamePage;
