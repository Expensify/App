import {useFocusEffect} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {ActivityIndicator} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import WorkspaceCompanyCardPageEmptyState from './WorkspaceCompanyCardPageEmptyState';
import WorkspaceCompanyCardsFeedPendingPage from './WorkspaceCompanyCardsFeedPendingPage';
import WorkspaceCompanyCardsList from './WorkspaceCompanyCardsList';
import WorkspaceCompanyCardsListHeaderButtons from './WorkspaceCompanyCardsListHeaderButtons';

type WorkspaceCompanyCardPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS>;

function WorkspaceCompanyCardPage({route}: WorkspaceCompanyCardPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const policyID = route.params.policyID;
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_MEMBER}${workspaceAccountID}`);
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`);
    const selectedFeed = CardUtils.getSelectedFeed(lastSelectedFeed, cardFeeds);
    const isLoading = !cardFeeds || cardFeeds.isLoading;

    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${selectedFeed}`);

    const fetchCompanyCards = useCallback(() => {
        Policy.openPolicyCompanyCardsPage(policyID, workspaceAccountID);
    }, [policyID, workspaceAccountID]);

    useFocusEffect(fetchCompanyCards);

    useEffect(() => {
        if (!isLoading) {
            Policy.openPolicyCompanyCardsFeed(policyID, selectedFeed);
        }
    }, [selectedFeed, isLoading]);

    const companyCards = cardFeeds?.settings?.companyCards ?? {};
    const selectedCompanyCard = companyCards[selectedFeed ?? ''] ?? null;
    const isNoFeed = !selectedCompanyCard;
    const isPending = selectedCompanyCard?.pending;
    const isFeedAdded = !isPending && !isNoFeed;

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            {isLoading && (
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={styles.flex1}
                    color={theme.spinner}
                />
            )}
            {!isLoading && (
                <WorkspacePageWithSections
                    shouldUseScrollView={isFeedAdded}
                    icon={Illustrations.CompanyCard}
                    headerText={translate('workspace.common.companyCards')}
                    route={route}
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_COMPANY_CARDS}
                    shouldShowOfflineIndicatorInWideScreen
                    includeSafeAreaPaddingBottom
                    showLoadingAsFirstRender={false}
                >
                    {(isFeedAdded || isPending) && (
                        <WorkspaceCompanyCardsListHeaderButtons
                            policyID={policyID}
                            selectedFeed={selectedFeed ?? ''}
                        />
                    )}
                    {isNoFeed && <WorkspaceCompanyCardPageEmptyState route={route} />}
                    {isPending && <WorkspaceCompanyCardsFeedPendingPage />}
                    {isFeedAdded && !isPending && (
                        <WorkspaceCompanyCardsList
                            cardsList={cardsList}
                            policyID={policyID}
                        />
                    )}
                </WorkspacePageWithSections>
            )}
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardPage.displayName = 'WorkspaceCompanyCardPage';

export default WorkspaceCompanyCardPage;
