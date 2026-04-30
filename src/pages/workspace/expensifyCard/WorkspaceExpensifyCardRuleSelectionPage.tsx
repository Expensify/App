import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useExpensifyCardRules from '@hooks/useExpensifyCardRulesList';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type WorkspaceExpensifyCardRuleSelectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_RULE_SELECTION>;

function WorkspaceExpensifyCardRuleSelectionPage({route}: WorkspaceExpensifyCardRuleSelectionPageProps) {
    const {policyID} = route.params;

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {cardRules, isLoadingCardRules} = useExpensifyCardRules(policyID);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceExpensifyCardRuleSelectionPage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton title={translate('workspace.card.chooseRule')} />

                {!!isLoadingCardRules && (
                    <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <ActivityIndicator
                            color={theme.spinner}
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            style={[styles.pl3]}
                            reasonAttributes={{
                                context: 'WorkspaceExpensifyCardRuleSelectionPage',
                                isLoadingFromOnyx: true,
                            }}
                        />
                    </View>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardRuleSelectionPage;
