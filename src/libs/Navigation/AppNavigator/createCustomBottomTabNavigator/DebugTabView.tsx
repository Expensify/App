import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import type {IndicatorStatus} from '@hooks/useIndicatorStatus';
import useIndicatorStatus from '@hooks/useIndicatorStatus';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import {getChatTabBrickRoadReport} from '@libs/WorkspacesSettingsUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type DebugTabViewProps = {
    selectedTab?: string;
    chatTabBrickRoad: BrickRoad;
    activeWorkspaceID?: string;
};

function getSettingsMessage(status: IndicatorStatus | undefined): TranslationPaths | undefined {
    switch (status) {
        case CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR:
            return 'debug.indicatorStatus.workspaceHasCustomUnitsErrors';
        case CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR:
            return 'debug.indicatorStatus.workspaceHasEmployeeListErrors';
        case CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR:
            return 'debug.indicatorStatus.theresAProblemWithAContactMethod';
        case CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO:
            return 'debug.indicatorStatus.contactMethodRequiresVerification';
        case CONST.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR:
            return 'debug.indicatorStatus.theresAProblemWithAPaymentMethod';
        case CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS:
            return 'debug.indicatorStatus.theresAProblemWithAWorkspace';
        case CONST.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS:
            return 'debug.indicatorStatus.workspaceHasReimbursementAccountError';
        case CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS:
            return 'debug.indicatorStatus.subscriptionHasErrors';
        case CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO:
            return 'debug.indicatorStatus.subscriptionRequiresAttention';
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

function getSettingsRoute(status: IndicatorStatus | undefined, policyIDWithErrors = ''): Route | undefined {
    switch (status) {
        case CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR:
            return ROUTES.WORKSPACE_INITIAL.getRoute(policyIDWithErrors);
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
            return ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute('', policyIDWithErrors);
        case CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS:
            return ROUTES.SETTINGS_SUBSCRIPTION;
        case CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO:
            return ROUTES.SETTINGS_SUBSCRIPTION;
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

function DebugTabView({selectedTab = '', chatTabBrickRoad, activeWorkspaceID}: DebugTabViewProps) {
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {status, indicatorColor, policyIDWithErrors} = useIndicatorStatus();

    const message = useMemo((): TranslationPaths | undefined => {
        if (selectedTab === SCREENS.HOME) {
            if (chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
                return 'debug.indicatorStatus.theresAReportAwaitingAction';
            }
            if (chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
                return 'debug.indicatorStatus.theresAReportWithErrors';
            }
        }
        if (selectedTab === SCREENS.SETTINGS.ROOT) {
            return getSettingsMessage(status);
        }
    }, [selectedTab, chatTabBrickRoad, status]);

    const indicator = useMemo(() => {
        if (selectedTab === SCREENS.HOME) {
            if (chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
                return theme.success;
            }
            if (chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
                return theme.danger;
            }
        }
        if (selectedTab === SCREENS.SETTINGS.ROOT) {
            if (status) {
                return indicatorColor;
            }
        }
    }, [selectedTab, chatTabBrickRoad, theme.success, theme.danger, status, indicatorColor]);

    const navigateTo = useCallback(() => {
        if (selectedTab === SCREENS.HOME && !!chatTabBrickRoad) {
            const report = getChatTabBrickRoadReport(activeWorkspaceID);

            if (report) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.reportID));
            }
        }
        if (selectedTab === SCREENS.SETTINGS.ROOT) {
            const route = getSettingsRoute(status, policyIDWithErrors);

            if (route) {
                Navigation.navigate(route);
            }
        }
    }, [selectedTab, chatTabBrickRoad, activeWorkspaceID, status, policyIDWithErrors]);

    if (!([SCREENS.HOME, SCREENS.SETTINGS.ROOT] as string[]).includes(selectedTab) || !indicator) {
        return null;
    }

    return (
        <View style={[StyleUtils.getBackgroundColorStyle(theme.cardBG), styles.p3, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
            <View style={[styles.flexRow, styles.gap2, styles.flex1, styles.alignItemsCenter]}>
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={indicator}
                />
                {message && <Text style={[styles.textWhite, styles.lh20]}>{translate(message)}</Text>}
            </View>
            <Button
                text="View"
                onPress={navigateTo}
            />
        </View>
    );
}

DebugTabView.displayName = 'DebugTabView';

export default DebugTabView;
