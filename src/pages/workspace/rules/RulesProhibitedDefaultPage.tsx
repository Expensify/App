import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setPolicyProhibitedExpense} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type ProhibitedExpensesProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_PROHIBITED_DEFAULT>;

function RulesProhibitedDefaultPage({
    route: {
        params: {policyID},
    },
}: ProhibitedExpensesProps) {
    const policy = usePolicy(policyID);

    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="RulesProhibitedDefaultPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.individualExpenseRules.prohibitedExpenses')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <ScrollView addBottomSafeAreaPadding>
                    <Text style={[styles.flexRow, styles.alignItemsCenter, styles.mt3, styles.mh5, styles.mb5]}>
                        <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.prohibitedDefaultDescription')}</Text>
                    </Text>

                    {Object.values(CONST.POLICY.PROHIBITED_EXPENSES).map((prohibitedExpense) => (
                        <OfflineWithFeedback
                            pendingAction={policy?.prohibitedExpenses?.pendingFields?.[prohibitedExpense]}
                            key={translate(`workspace.rules.individualExpenseRules.${prohibitedExpense}`)}
                        >
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mt3, styles.mh5, styles.mb5]}>
                                <Text style={[styles.flex1, styles.mr2]}>{translate(`workspace.rules.individualExpenseRules.${prohibitedExpense}`)}</Text>
                                <Switch
                                    isOn={policy?.prohibitedExpenses?.[prohibitedExpense] ?? false}
                                    accessibilityLabel={translate(`workspace.rules.individualExpenseRules.${prohibitedExpense}`)}
                                    onToggle={() => {
                                        setPolicyProhibitedExpense(policyID, prohibitedExpense);
                                    }}
                                />
                            </View>
                        </OfflineWithFeedback>
                    ))}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RulesProhibitedDefaultPage;
