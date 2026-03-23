import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import type {ListItem} from '@components/SelectionList/types';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardFeedsForFeedSelector from '@hooks/useExpensifyCardFeedsForFeedSelector';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIssueNewCardStepAndData, updateSelectedExpensifyCardFeed} from '@libs/actions/Card';
import type {ExpensifyCardFeedEntry} from '@libs/ExpensifyCardFeedSelectorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getDescriptionForPolicyDomainCard} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ExpensifyFeedListItem = ListItem & {
    value: number;
};

type WorkspaceExpensifyCardFeedSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SELECT_FEED>;

function WorkspaceExpensifyCardFeedSelectorPage({route}: WorkspaceExpensifyCardFeedSelectorPageProps) {
    const {policyID, exitToIssueNew: exitToIssueNewParam} = route.params;
    const exitToIssueNew = exitToIssueNewParam === 'true';
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['ExpensifyCardImage']);
    const [lastSelectedExpensifyCardFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${policyID}`);
    const defaultFundID = useDefaultFundID(policyID);
    const lastSelectedExpensifyCardFeedID = lastSelectedExpensifyCardFeed ?? defaultFundID;

    const {primaryFeeds, otherFeeds} = useExpensifyCardFeedsForFeedSelector(policyID);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const getFeedSelectorRowText = (entry: ExpensifyCardFeedEntry) => {
        const domainName = entry.settings?.domainName ?? '';
        if (domainName) {
            return getDescriptionForPolicyDomainCard(domainName, policies);
        }
        const preferredPolicyID = entry.settings?.preferredPolicy;
        return (preferredPolicyID && policies?.[`${ONYXKEYS.COLLECTION.POLICY}${preferredPolicyID}`]?.name) ?? '';
    };

    const toListItem = (entry: ExpensifyCardFeedEntry): ExpensifyFeedListItem => ({
        value: entry.fundID,
        text: getFeedSelectorRowText(entry),
        keyForList: entry.fundID.toString(),
        isSelected: entry.fundID === lastSelectedExpensifyCardFeedID,
        leftElement: (
            <Icon
                src={illustrations.ExpensifyCardImage}
                height={variables.cardIconHeight}
                width={variables.cardIconWidth}
                additionalStyles={[styles.mr3, styles.cardIcon]}
            />
        ),
    });

    const sections: Array<Section<ExpensifyFeedListItem>> = [];
    if (primaryFeeds.length > 0) {
        sections.push({
            data: primaryFeeds.map(toListItem),
            sectionIndex: sections.length,
        });
    }
    if (otherFeeds.length > 0) {
        sections.push({
            title: translate('workspace.expensifyCard.otherWorkspaces'),
            data: otherFeeds.map(toListItem),
            sectionIndex: sections.length,
        });
    }

    const goBack = () => Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID));

    const selectFeed = (feed: ExpensifyFeedListItem) => {
        updateSelectedExpensifyCardFeed(feed.value, policyID);
        if (exitToIssueNew) {
            setIssueNewCardStepAndData({policyID, isChangeAssigneeDisabled: false});
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)));
            return;
        }
        goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceExpensifyCardFeedSelectorPage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.companyCards.selectCards')}
                    onBackButtonPress={goBack}
                />
                <SelectionListWithSections
                    ListItem={RadioListItem}
                    onSelectRow={selectFeed}
                    sections={sections}
                    initiallyFocusedItemKey={lastSelectedExpensifyCardFeedID.toString()}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardFeedSelectorPage;
