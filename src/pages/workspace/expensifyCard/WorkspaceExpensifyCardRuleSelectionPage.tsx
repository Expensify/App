import React, {useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import CardRuleListItem from '@components/SelectionList/ListItem/CardRuleListItem';
import {CardRuleListItemType} from '@components/SelectionList/ListItem/types';
import useExpensifyCardRules from '@hooks/useExpensifyCardRulesList';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIssueNewCardData} from '@libs/actions/Card';
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
    const [cardRuleID, setCardRuleID] = useState('');
    const {cardRules, isLoadingCardRules} = useExpensifyCardRules(policyID);

    const cardRuleListItems: CardRuleListItemType[] = cardRules.map((cardRule) => ({
        keyForList: cardRule.ruleID,
        accessibilityLabel: 'JACK_TODO',
        action: cardRule.action,
        summary: cardRule.cardSummary,
        summaryParts: cardRule.summaryParts,
    }));

    const onSelectCardRule = (item: CardRuleListItemType) => {
        setCardRuleID(item.keyForList);
    };

    const onSave = () => {
        setIssueNewCardData(policyID, {cardRuleID});
    };

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

                {!isLoadingCardRules && (
                    <SelectionList
                        ListItem={CardRuleListItem}
                        data={cardRuleListItems}
                        canSelectMultiple={false}
                        onSelectRow={onSelectCardRule}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardRuleSelectionPage;
