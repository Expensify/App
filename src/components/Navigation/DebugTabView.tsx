import reportsSelector from '@selectors/Attributes';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import Icon from '@components/Icon';
import Text from '@components/Text';
import useIndicatorStatus from '@hooks/useIndicatorStatus';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import type {IndicatorStatus} from '@hooks/useNavigationTabBarIndicatorChecks';
import useOnyx from '@hooks/useOnyx';
import {useSidebarOrderedReports} from '@hooks/useSidebarOrderedReports';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getRouteForCurrentStep as getReimbursementAccountRouteForCurrentStep} from '@libs/ReimbursementAccountUtils';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import {getChatTabBrickRoadReportID} from '@libs/WorkspacesSettingsUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {ReimbursementAccount} from '@src/types/onyx';
import NAVIGATION_TABS from './NavigationTabBar/NAVIGATION_TABS';

type DebugTabViewProps = {
    selectedTab?: ValueOf<typeof NAVIGATION_TABS>;
    chatTabBrickRoad: BrickRoad;
};

function getSettingsMessage(status: IndicatorStatus | undefined): TranslationPaths | undefined {
    switch (status) {
        case CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR:
            return 'debug.indicatorStatus.theresAWorkspaceWithCustomUnitsErrors';
        case CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR:
            return 'debug.indicatorStatus.theresAProblemWithAWorkspaceMember';
        case CONST.INDICATOR_STATUS.HAS_QBO_EXPORT_ERROR:
            return 'debug.indicatorStatus.theresAProblemWithAWorkspaceQBOExport';
        case CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR:
            return 'debug.indicatorStatus.theresAProblemWithAContactMethod';
        case CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO:
            return 'debug.indicatorStatus.aContactMethodRequiresVerification';
        case CONST.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR:
            return 'debug.indicatorStatus.theresAProblemWithAPaymentMethod';
        case CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS:
            return 'debug.indicatorStatus.theresAProblemWithAWorkspace';
        case CONST.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS:
            return 'debug.indicatorStatus.theresAProblemWithYourReimbursementAccount';
        case CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS:
            return 'debug.indicatorStatus.theresABillingProblemWithYourSubscription';
        case CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO:
            return 'debug.indicatorStatus.yourSubscriptionHasBeenSuccessfullyRenewed';
        case CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS:
            return 'debug.indicatorStatus.theresWasAProblemDuringAWorkspaceConnectionSync';
        case CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS:
            return 'debug.indicatorStatus.theresAProblemWithYourWallet';
        case CONST.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS:
            return 'debug.indicatorStatus.theresAProblemWithYourWalletTerms';
        default:
            return undefined;
    }
}

function getSettingsRoute(status: IndicatorStatus | undefined, reimbursementAccount: OnyxEntry<ReimbursementAccount>, policyIDWithErrors = ''): Route | undefined {
    switch (status) {
        case CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR:
            return ROUTES.WORKSPACE_DISTANCE_RATES.getRoute(policyIDWithErrors);
        case CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR:
            return ROUTES.WORKSPACE_MEMBERS.getRoute(policyIDWithErrors);
        case CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR:
            return ROUTES.SETTINGS_CONTACT_METHODS.route;
        case CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO:
            return ROUTES.SETTINGS_CONTACT_METHODS.route;
        case CONST.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR:
            return ROUTES.SETTINGS_WALLET;
        case CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS:
            return ROUTES.WORKSPACE_INITIAL.getRoute(policyIDWithErrors);
        case CONST.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS:
            return ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(
                reimbursementAccount?.achData?.policyID,
                getReimbursementAccountRouteForCurrentStep(reimbursementAccount?.achData?.currentStep ?? CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT),
            );
        case CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS:
            return ROUTES.SETTINGS_SUBSCRIPTION.route;
        case CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO:
            return ROUTES.SETTINGS_SUBSCRIPTION.route;
        case CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS:
            return ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyIDWithErrors);
        case CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS:
            return ROUTES.SETTINGS_WALLET;
        case CONST.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS:
            return ROUTES.SETTINGS_WALLET;
        default:
            return undefined;
    }
}

function DebugTabView({selectedTab, chatTabBrickRoad}: DebugTabViewProps) {
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator'] as const);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: reportsSelector, canBeMissing: true});
    const {status, indicatorColor, policyIDWithErrors} = useIndicatorStatus();
    const {orderedReportIDs} = useSidebarOrderedReports();

    const message = useMemo((): TranslationPaths | undefined => {
        if (selectedTab === NAVIGATION_TABS.INBOX) {
            if (chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
                return 'debug.indicatorStatus.theresAReportAwaitingAction';
            }
            if (chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
                return 'debug.indicatorStatus.theresAReportWithErrors';
            }
        }
        if (selectedTab === NAVIGATION_TABS.SETTINGS || selectedTab === NAVIGATION_TABS.WORKSPACES) {
            return getSettingsMessage(status);
        }
    }, [selectedTab, chatTabBrickRoad, status]);

    const indicator = useMemo(() => {
        if (selectedTab === NAVIGATION_TABS.INBOX) {
            if (chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
                return theme.success;
            }
            if (chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
                return theme.danger;
            }
        }
        if (selectedTab === NAVIGATION_TABS.SETTINGS || selectedTab === NAVIGATION_TABS.WORKSPACES) {
            if (status) {
                return indicatorColor;
            }
        }
    }, [selectedTab, chatTabBrickRoad, theme.success, theme.danger, status, indicatorColor]);

    const navigateTo = useCallback(() => {
        if (selectedTab === NAVIGATION_TABS.INBOX && !!chatTabBrickRoad) {
            const reportID = getChatTabBrickRoadReportID(orderedReportIDs, reportAttributes);

            if (reportID) {
                Navigation.navigate(ROUTES.DEBUG_REPORT.getRoute(reportID));
            }
        }
        if (selectedTab === NAVIGATION_TABS.SETTINGS) {
            const route = getSettingsRoute(status, reimbursementAccount, policyIDWithErrors);

            if (route) {
                Navigation.navigate(route);
            }
        }
    }, [selectedTab, chatTabBrickRoad, orderedReportIDs, reportAttributes, status, reimbursementAccount, policyIDWithErrors]);

    if (!([NAVIGATION_TABS.INBOX, NAVIGATION_TABS.SETTINGS, NAVIGATION_TABS.WORKSPACES] as string[]).includes(selectedTab ?? '') || !indicator) {
        return null;
    }

    return (
        <View
            testID="DebugTabView"
            style={[StyleUtils.getBackgroundColorStyle(theme.cardBG), styles.p3, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}
        >
            <View style={[styles.flexRow, styles.gap2, styles.flex1, styles.alignItemsCenter]}>
                <Icon
                    src={icons.DotIndicator}
                    fill={indicator}
                />
                {!!message && <Text style={[StyleUtils.getColorStyle(theme.text), styles.lh20]}>{translate(message)}</Text>}
            </View>
            <Button
                text={translate('common.view')}
                onPress={navigateTo}
            />
        </View>
    );
}

export default DebugTabView;
