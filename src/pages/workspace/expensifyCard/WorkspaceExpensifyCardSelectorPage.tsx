import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFundIdFromSettingsKey} from '@libs/CardUtils';
import {getDescriptionForPolicyDomainCard} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {updateSelectedExpensifyCardFeed} from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ExpensifyFeedListItem = ListItem & {
    /** Expensify Card feed value */
    value: number;
};

type WorkspaceExpensifyCardSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_SELECT_FEED>;

function WorkspaceExpensifyCardSelectorPage({route}: WorkspaceExpensifyCardSelectorPageProps) {
    const {policyID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['ExpensifyCardImage']);
    const [lastSelectedExpensifyCardFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${policyID}`, {canBeMissing: true});
    const defaultFundID = useDefaultFundID(policyID);
    const lastSelectedExpensifyCardFeedID = lastSelectedExpensifyCardFeed ?? defaultFundID;

    const allExpensifyCardFeeds = useExpensifyCardFeeds(policyID);

    const feeds: ExpensifyFeedListItem[] = Object.entries(allExpensifyCardFeeds ?? {}).map(([key, value]) => {
        const fundID = getFundIdFromSettingsKey(key) ?? CONST.DEFAULT_NUMBER_ID;
        return {
            value: fundID,
            text: getDescriptionForPolicyDomainCard(value?.domainName ?? ''),
            keyForList: fundID.toString(),
            isSelected: fundID === lastSelectedExpensifyCardFeedID,
            leftElement: (
                <Icon
                    src={illustrations.ExpensifyCardImage}
                    height={variables.cardIconHeight}
                    width={variables.cardIconWidth}
                    additionalStyles={[styles.mr3, styles.cardIcon]}
                />
            ),
        };
    });

    const goBack = () => Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID));

    const selectFeed = (feed: ExpensifyFeedListItem) => {
        updateSelectedExpensifyCardFeed(feed.value, policyID);
        goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceExpensifyCardSelectorPage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.companyCards.selectCards')}
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    ListItem={RadioListItem}
                    onSelectRow={selectFeed}
                    data={feeds}
                    alternateNumberOfSupportedLines={2}
                    initiallyFocusedItemKey={lastSelectedExpensifyCardFeed?.toString()}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardSelectorPage;
