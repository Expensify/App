import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type RulesAutoApproveReportsUnderPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_AUTO_APPROVE_REPORTS_UNDER>;

function RulesAutoApproveReportsUnderPage({route}: RulesAutoApproveReportsUnderPageProps) {
    const {policyID} = route.params;

    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID ?? '-1'}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={RulesAutoApproveReportsUnderPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.expenseReportRules.customNameTitle')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={[{paddingHorizontal: 20}, styles.pt3, styles.pb4]}>
                    <Text>
                        {translate('workspace.rules.expenseReportRules.customNameDescription')}
                        <TextLink
                            style={[styles.link]}
                            href="https://help.expensify.com/articles/expensify-classic/spending-insights/Custom-Templates"
                        >
                            {translate('workspace.rules.expenseReportRules.customNameDescriptionLink')}
                        </TextLink>
                        .
                    </Text>
                </View>
                {/* <FormProvider
                    style={[styles.flexGrow1, styles.mh5]}
                    formID={ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM}
                    // validate={validator}
                    onSubmit={({customName}) => WorkspaceRulesActions.modifyPolicyDefaultReportTitle(customName, policyID)}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.CUSTOM_NAME}
                        label={translate('workspace.rules.expenseReportRules.customNameInputLabel')}
                        aria-label={translate('workspace.rules.expenseReportRules.customNameInputLabel')}
                        maxLength={CONST.WORKSPACE_NAME_CHARACTER_LIMIT}
                    />
                </FormProvider> */}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

RulesAutoApproveReportsUnderPage.displayName = 'RulesAutoApproveReportsUnderPage';

export default RulesAutoApproveReportsUnderPage;
