import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import BulletList from '@components/BulletList';
import FormProvider from '@components/Form/FormProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type RulesReceiptRequiredAmountPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_CUSTOM_NAME>;

function RulesCustomNamePage({route}: RulesReceiptRequiredAmountPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const RULE_EXAMPLE_BULLET_POINTS = [
        translate('workspace.rules.expenseReportRules.customNameEmailPhoneExample'),
        translate('workspace.rules.expenseReportRules.customNameStartDateExample'),
        translate('workspace.rules.expenseReportRules.customNameWorkspaceNameExample'),
        translate('workspace.rules.expenseReportRules.customNameReportIDExample'),
        translate('workspace.rules.expenseReportRules.customNameTotalExample'),
    ] as const;

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID ?? '-1'}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
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
                <View style={[{paddingHorizontal: 20}, styles.pt3, styles.pb4]}>
                    <Text>
                        {translate('workspace.rules.expenseReportRules.customNameDescription')}
                        <TextLink
                            style={[styles.link]}
                            onPress={() => {}}
                        >
                            {translate('workspace.rules.expenseReportRules.customNameDescriptionLink')}
                        </TextLink>
                        .
                    </Text>
                </View>
                <FormProvider
                    style={[styles.flexGrow1, styles.mh5]}
                    formID={ONYXKEYS.FORMS.RULES_CUSTOM_NAME_MODAL_FORM}
                    // validate={validator}
                    onSubmit={() => {}}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <TextInput
                        accessibilityLabel={translate('workspace.rules.expenseReportRules.customNameInputLabel')}
                        label={translate('workspace.rules.expenseReportRules.customNameInputLabel')}
                    />
                    <BulletList
                        items={RULE_EXAMPLE_BULLET_POINTS}
                        header="Examples:"
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

RulesCustomNamePage.displayName = 'RulesCustomNamePage';

export default RulesCustomNamePage;
