import React from 'react';
import {useOnyx} from 'react-native-onyx';
import ExpensifyCardImage from '@assets/images/expensify-card.svg';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import useLocalize from '@hooks/useLocalize';
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
    const [lastSelectedExpensifyCardFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${policyID}`);
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
                    src={ExpensifyCardImage}
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
                testID={WorkspaceExpensifyCardSelectorPage.displayName}
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
                    sections={[{data: feeds}]}
                    shouldUpdateFocusedIndex
                    isAlternateTextMultilineSupported
                    initiallyFocusedOptionKey={lastSelectedExpensifyCardFeed?.toString()}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceExpensifyCardSelectorPage.displayName = 'WorkspaceExpensifyCardSelectorPage';

export default WorkspaceExpensifyCardSelectorPage;
