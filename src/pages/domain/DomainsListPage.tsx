import {useRoute} from '@react-navigation/native';
import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBarWithLoadingBar from '@components/Navigation/TopBarWithLoadingBar';
import ScreenWrapper from '@components/ScreenWrapper';
import DomainListTable from '@components/Tables/DomainListTable';
import  {DomainRowData} from '@components/Tables/WorkspaceListTable';
import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasDomainErrors} from '@libs/DomainUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceNavigatorParamList} from '@libs/Navigation/types';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isAdminSelector} from '@src/selectors/Domain';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function WorkspacesListPage() {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    useDocumentTitle(translate('common.domains'));

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    const route = useRoute<PlatformStackRouteProp<WorkspaceNavigatorParamList, typeof SCREENS.WORKSPACES_LIST>>();

    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [allDomainErrors] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN_ERRORS);
    const tabBarContent = <TabBarBottomContent selectedTab={NAVIGATION_TABS.WORKSPACES} />;

    const navigateToDomain = ({domainAccountID, isAdmin}: {domainAccountID: number; isAdmin: boolean}) => {
        if (!isAdmin) {
            return Navigation.navigate(ROUTES.WORKSPACES_DOMAIN_ACCESS_RESTRICTED.getRoute(domainAccountID));
        }

        Navigation.navigate(ROUTES.DOMAIN_INITIAL.getRoute(domainAccountID));
    };

    const domainRows: DomainRowData[] = [];

    if (!isEmptyObject(allDomains)) {
        for (const domain of Object.values(allDomains)) {
            if (!domain?.accountID || !domain.email) {
                continue;
            }

            const isDomainAdmin = isAdminSelector(currentUserPersonalDetails?.accountID)(domain);
            const domainErrors = allDomainErrors?.[`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domain.accountID}`];

            domainRows.push({
                rowType: 'domain',
                isAdmin: isDomainAdmin,
                isValidated: domain.validated,
                domainAccountID: domain.accountID,
                title: Str.extractEmailDomain(domain.email),
                errors: domainErrors?.errors,
                pendingAction: domain.pendingAction,
                brickRoadIndicator: hasDomainErrors(domainErrors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                action: () => navigateToDomain({domainAccountID: domain.accountID, isAdmin: isDomainAdmin}),
            });
        }
    }

    // JACK_TODO: Move to table
    // const headerButton = (
    //     <WorkspacesListPageHeaderButton
    //         shouldShowNewWorkspaceButton={!isRestrictedPolicyCreation && (!!domains.length || !!workspaces.length)}
    //         shouldShowNewDomainButton={!!domains.length}
    //     />
    // );

    const onBackButtonPress = () => {
        Navigation.goBack(route.params?.backTo);
        return true;
    };

    useAndroidBackButtonHandler(onBackButtonPress);
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            shouldShowOfflineIndicatorInWideScreen
            testID="DomainsListPage"
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContent={tabBarContent}
            bottomContentStyle={styles.overflowVisible}
        >
            <View style={styles.flex1}>
                <TopBarWithLoadingBar
                    breadcrumbLabel={translate('common.domains')}
                    shouldDisplayHelpButton
                >
                    {/* {!shouldDisplayButtonsInSeparateLine && <View style={styles.pr2}>{headerButton}</View>} */}
                </TopBarWithLoadingBar>
                {/* {shouldDisplayButtonsInSeparateLine && <View style={[styles.ph5, styles.pt2]}>{headerButton}</View>} */}
                {shouldShowLoadingIndicator && (
                    <View style={[styles.flex1, styles.fullScreenLoading]}>
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            reasonAttributes={
                                {
                                    context: 'WorkspacesListPage',
                                    isOffline,
                                } satisfies SkeletonSpanReasonAttributes
                            }
                        />
                    </View>
                )}

                {!shouldShowLoadingIndicator && <DomainListTable domains={domainRows} />}
            </View>
        </ScreenWrapper>
    );
}

export default WorkspacesListPage;
