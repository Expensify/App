import React, {useMemo} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import HighlightableMenuItem from '@components/HighlightableMenuItem';
import {ExpensifyAppIcon} from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDefaultWorkspaceAvatar, getReportName} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {WithPolicyProps} from './withPolicy';
import type {WorkspaceMenuItem} from './WorkspaceInitialPage';

type WorkspaceInitialPageViewProps = {
    shouldShowNotFoundPage: boolean;
    shouldShowPolicy: boolean;
    workspaceMenuItems: WorkspaceMenuItem[];
    hasPolicyCreationError: boolean;
    isExecuting: boolean;
    isPolicyExpenseChatEnabled: boolean;
    currentUserPolicyExpenseChatReportID?: string;
    reportPendingAction?: PendingAction;
    activeRoute?: string;
    dismissError: (policyID: string | undefined, pendingAction: PendingAction | undefined) => void;
    route: PlatformStackRouteProp<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.INITIAL>;
} & Omit<WithPolicyProps, 'policyDraft' | 'isLoadingPolicy'>;

function WorkspaceInitialPageContent({
    shouldShowNotFoundPage,
    shouldShowPolicy,
    policy,
    workspaceMenuItems,
    hasPolicyCreationError,
    isExecuting,
    route,
    isPolicyExpenseChatEnabled,
    currentUserPolicyExpenseChatReportID,
    reportPendingAction,
    activeRoute,
    dismissError,
}: WorkspaceInitialPageViewProps) {
    const policyID = policy?.id;
    const policyName = policy?.name ?? '';
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [currentUserPolicyExpenseChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentUserPolicyExpenseChatReportID}`, {canBeMissing: true});

    const policyAvatar = useMemo(() => {
        if (!policy) {
            return {source: ExpensifyAppIcon, name: CONST.EXPENSIFY_ICON_NAME, type: CONST.ICON_TYPE_AVATAR};
        }

        const avatar = policy?.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy?.name);
        return {
            source: avatar,
            name: policy?.name ?? '',
            type: CONST.ICON_TYPE_WORKSPACE,
            id: policy.id,
        };
    }, [policy]);

    return (
        <ScreenWrapper
            testID={WorkspaceInitialPageContent.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding={false}
        >
            <FullPageNotFoundView
                onBackButtonPress={Navigation.dismissModal}
                onLinkPress={Navigation.goBackToHome}
                shouldShow={shouldShowNotFoundPage}
                subtitleKey={shouldShowPolicy ? 'workspace.common.notAuthorized' : undefined}
                addBottomSafeAreaPadding
                shouldForceFullScreen
                shouldDisplaySearchRouter
            >
                <HeaderWithBackButton
                    title={policyName}
                    onBackButtonPress={() => Navigation.goBack(route.params?.backTo ?? ROUTES.WORKSPACES_LIST.route)}
                    policyAvatar={policyAvatar}
                    shouldDisplayHelpButton={shouldUseNarrowLayout}
                />

                <ScrollView contentContainerStyle={[styles.flexColumn]}>
                    <OfflineWithFeedback
                        pendingAction={policy?.pendingAction}
                        onClose={() => dismissError(policyID, policy?.pendingAction)}
                        errors={policy?.errors}
                        errorRowStyles={[styles.ph5, styles.pv2]}
                        shouldDisableStrikeThrough={false}
                        shouldHideOnDelete={false}
                        shouldShowErrorMessages={false}
                    >
                        <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                            {/*
                                Ideally we should use MenuList component for MenuItems with singleExecution/Navigation actions.
                                In this case where user can click on workspace avatar or menu items, we need to have a check for `isExecuting`. So, we are directly mapping menuItems.
                            */}
                            {workspaceMenuItems.map((item) => (
                                <HighlightableMenuItem
                                    key={item.translationKey}
                                    disabled={hasPolicyCreationError || isExecuting}
                                    interactive={!hasPolicyCreationError}
                                    title={translate(item.translationKey)}
                                    icon={item.icon}
                                    onPress={item.action}
                                    brickRoadIndicator={item.brickRoadIndicator}
                                    wrapperStyle={styles.sectionMenuItem}
                                    highlighted={!!item?.highlighted}
                                    focused={!!(item.screenName && activeRoute?.startsWith(item.screenName))}
                                    badgeText={item.badgeText}
                                    shouldIconUseAutoWidthStyle
                                />
                            ))}
                        </View>
                    </OfflineWithFeedback>
                    {isPolicyExpenseChatEnabled && !!currentUserPolicyExpenseChatReportID && (
                        <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                            <Text style={[styles.textSupporting, styles.fontSizeLabel, styles.ph2]}>{translate('workspace.common.submitExpense')}</Text>
                            <OfflineWithFeedback
                                pendingAction={reportPendingAction}
                                shouldShowErrorMessages={false}
                            >
                                <MenuItem
                                    title={getReportName(currentUserPolicyExpenseChat)}
                                    description={translate('workspace.common.workspace')}
                                    onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(currentUserPolicyExpenseChat?.reportID))}
                                    shouldShowRightIcon
                                    wrapperStyle={[styles.br2, styles.pl2, styles.pr0, styles.pv3, styles.mt1, styles.alignItemsCenter]}
                                    iconReportID={currentUserPolicyExpenseChatReportID}
                                />
                            </OfflineWithFeedback>
                        </View>
                    )}
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspaceInitialPageContent.displayName = 'WorkspaceInitialPageView';

export default WorkspaceInitialPageContent;
