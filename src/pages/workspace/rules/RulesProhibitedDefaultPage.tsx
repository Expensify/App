import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
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
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={RulesProhibitedDefaultPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.individualExpenseRules.prohibitedExpenses')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <Text style={[styles.flexRow, styles.alignItemsCenter, styles.mt3, styles.mh5, styles.mb5]}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.prohibitedDefaultDescription')}</Text>
                </Text>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mt3, styles.mh5, styles.mb5]}>
                    <Text>{translate('workspace.rules.individualExpenseRules.alcohol')}</Text>
                    <Switch
                        isOn={policy?.prohibitedExpenses?.alcohol ?? false}
                        accessibilityLabel={translate('workspace.rules.individualExpenseRules.alcohol')}
                        onToggle={() => console.log('Switched')}
                    />
                </View>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mt3, styles.mh5, styles.mb5]}>
                    <Text>{translate('workspace.rules.individualExpenseRules.hotelIncidentals')}</Text>
                    <Switch
                        isOn={policy?.prohibitedExpenses?.hotelIncidentals ?? false}
                        accessibilityLabel={translate('workspace.rules.individualExpenseRules.hotelIncidentals')}
                        onToggle={() => console.log('Switched')}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

RulesProhibitedDefaultPage.displayName = 'RulesProhibitedDefaultPage';

export default RulesProhibitedDefaultPage;
