import {useFocusEffect} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {ActivityIndicator} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import WorkspaceCompanyCardPageEmptyState from './WorkspaceCompanyCardPageEmptyState';
import WorkspaceCompanyCardsFeedAddedEmptyPage from './WorkspaceCompanyCardsFeedAddedEmptyPage';
import WorkspaceCompanyCardsFeedNoFeedPendingPage from './WorkspaceCompanyCardsFeedNoFeedPendingPage';

type WorkspaceCompanyCardPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS>;

function WorkspaceCompanyCardPage({route}: WorkspaceCompanyCardPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.workspaceAccountID ?? -1;
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID.toString()}`);
    const fetchCompanyCards = useCallback(() => {
        Policy.openPolicyCompanyCardsPage(policyID, workspaceAccountID);
    }, [policyID, workspaceAccountID]);

    useFocusEffect(fetchCompanyCards);

    const companyCards = cardFeeds?.companyCards;
    const companyCardsLength = Object.keys(companyCards ?? {}).length;
    const isNoFeed = companyCardsLength === 0;
    const isFeedAdded = companyCardsLength > 0 && !Object.values(companyCards ?? {})[0].pending;
    const isPending = companyCardsLength === 1 && Object.values(companyCards ?? {})[0].pending;
    const isLoading = !cardFeeds || cardFeeds.isLoading;

    const getHeaderButtons = () => (
        <View style={[styles.w100, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
            <Button
                medium
                success
                isDisabled={isPending}
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID))}
                icon={Expensicons.Plus}
                text={translate('workspace.moreFeatures.companyCards.assignCard')}
                style={shouldUseNarrowLayout && styles.flex1}
            />
            <Button
                medium
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID))}
                icon={Expensicons.Gear}
                text={translate('common.settings')}
                style={shouldUseNarrowLayout && styles.flex1}
            />
        </View>
    );

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
            <WorkspacePageWithSections
                shouldUseScrollView={!isFeedAdded}
                icon={Illustrations.CompanyCard}
                headerText={translate('workspace.common.companyCards')}
                route={route}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_COMPANY_CARDS}
                shouldShowOfflineIndicatorInWideScreen
                headerContent={!shouldUseNarrowLayout && getHeaderButtons()}
            >
                {isNoFeed && !isLoading && <WorkspaceCompanyCardPageEmptyState route={route} />}
                {isFeedAdded && !isLoading && <WorkspaceCompanyCardsFeedAddedEmptyPage />}
                {isPending && !isLoading && <WorkspaceCompanyCardsFeedNoFeedPendingPage />}
                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardPage.displayName = 'WorkspaceCompanyCardPage';

export default WorkspaceCompanyCardPage;
