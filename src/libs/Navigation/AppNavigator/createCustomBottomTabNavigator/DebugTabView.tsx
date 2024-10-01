import React, {useCallback, useMemo} from 'react';
import {Text, View} from 'react-native';
import {ValueOf} from 'type-fest';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useSettingsStatus from '@hooks/useSettingsStatus';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {BrickRoad, getChatTabBrickRoadReport} from '@libs/WorkspacesSettingsUtils';
import CONST from '@src/CONST';
import {TranslationPaths} from '@src/languages/types';
import ROUTES, {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type DebugTabViewProps = {
    selectedTab?: string;
    chatTabBrickRoad: BrickRoad;
    activeWorkspaceID?: string;
};

function getSettingsMessage(status: ValueOf<typeof CONST.SETTINGS_STATUS> | undefined): TranslationPaths | undefined {
    switch (status) {
        case CONST.SETTINGS_STATUS.HAS_CUSTOM_UNITS_ERROR:
            return 'debug.settingsStatus.workspaceHasCustomUnitsErrors';
        case CONST.SETTINGS_STATUS.HAS_EMPLOYEE_LIST_ERROR:
            return 'debug.settingsStatus.workspaceHasEmployeeListErrors';
        case CONST.SETTINGS_STATUS.HAS_LOGIN_LIST_ERROR:
            return 'debug.settingsStatus.profileHasErrors';
        case CONST.SETTINGS_STATUS.HAS_LOGIN_LIST_INFO:
            return 'debug.settingsStatus.profileRequiresAttention';
        case CONST.SETTINGS_STATUS.HAS_PAYMENT_METHOD_ERROR:
            return 'debug.settingsStatus.walletHasPaymentMethodError';
        case CONST.SETTINGS_STATUS.HAS_POLICY_ERRORS:
            return 'debug.settingsStatus.workspaceHasErrors';
        case CONST.SETTINGS_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS:
            return 'debug.settingsStatus.workspaceHasReimbursementAccountError';
        case CONST.SETTINGS_STATUS.HAS_SUBSCRIPTION_ERRORS:
            return 'debug.settingsStatus.subscriptionHasErrors';
        case CONST.SETTINGS_STATUS.HAS_SUBSCRIPTION_INFO:
            return 'debug.settingsStatus.subscriptionRequiresAttention';
        case CONST.SETTINGS_STATUS.HAS_SYNC_ERRORS:
            return 'debug.settingsStatus.policyAccountingHasSyncErrors';
        case CONST.SETTINGS_STATUS.HAS_USER_WALLET_ERRORS:
            return 'debug.settingsStatus.walletHasErrors';
        case CONST.SETTINGS_STATUS.HAS_WALLET_TERMS_ERRORS:
            return 'debug.settingsStatus.walletHasTermsErrors';
        default:
            return undefined;
    }
}

function getSettingsRoute(status: ValueOf<typeof CONST.SETTINGS_STATUS> | undefined, idOfPolicyWithErrors = ''): Route | undefined {
    switch (status) {
        case CONST.SETTINGS_STATUS.HAS_CUSTOM_UNITS_ERROR:
            return ROUTES.SETTINGS_SUBSCRIPTION;
        case CONST.SETTINGS_STATUS.HAS_EMPLOYEE_LIST_ERROR:
            return ROUTES.WORKSPACE_MEMBERS.getRoute(idOfPolicyWithErrors);
        case CONST.SETTINGS_STATUS.HAS_LOGIN_LIST_ERROR:
            return ROUTES.SETTINGS_PROFILE;
        case CONST.SETTINGS_STATUS.HAS_LOGIN_LIST_INFO:
            return ROUTES.SETTINGS_PROFILE;
        case CONST.SETTINGS_STATUS.HAS_PAYMENT_METHOD_ERROR:
            return ROUTES.SETTINGS_WALLET;
        case CONST.SETTINGS_STATUS.HAS_POLICY_ERRORS:
            return ROUTES.WORKSPACE_INITIAL.getRoute(idOfPolicyWithErrors);
        case CONST.SETTINGS_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS:
            return ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute('', idOfPolicyWithErrors);
        case CONST.SETTINGS_STATUS.HAS_SUBSCRIPTION_ERRORS:
            return ROUTES.SETTINGS_SUBSCRIPTION;
        case CONST.SETTINGS_STATUS.HAS_SUBSCRIPTION_INFO:
            return ROUTES.SETTINGS_SUBSCRIPTION;
        case CONST.SETTINGS_STATUS.HAS_SYNC_ERRORS:
            return ROUTES.WORKSPACE_ACCOUNTING.getRoute(idOfPolicyWithErrors);
        case CONST.SETTINGS_STATUS.HAS_USER_WALLET_ERRORS:
            return ROUTES.SETTINGS_WALLET;
        case CONST.SETTINGS_STATUS.HAS_WALLET_TERMS_ERRORS:
            return ROUTES.SETTINGS_WALLET;
        default:
            return undefined;
    }
}

const DebugTabView = ({selectedTab = '', chatTabBrickRoad, activeWorkspaceID}: DebugTabViewProps) => {
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {status, indicatorColor, idOfPolicyWithErrors} = useSettingsStatus();

    const message = useMemo((): TranslationPaths | undefined => {
        if (selectedTab === SCREENS.HOME) {
            if (chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
                return 'debug.settingsStatus.theresAReportAwaitingAction';
            }
            if (chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
                return 'debug.settingsStatus.theresAReportWithErrors';
            }
        }
        if (selectedTab === SCREENS.SETTINGS.ROOT) {
            return getSettingsMessage(status);
        }
    }, [selectedTab, chatTabBrickRoad]);

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
    }, [selectedTab, chatTabBrickRoad]);

    const navigateTo = useCallback(() => {
        if (selectedTab === SCREENS.HOME && !!chatTabBrickRoad) {
            const report = getChatTabBrickRoadReport(activeWorkspaceID);

            if (report) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.reportID));
            }
        }
        if (selectedTab === SCREENS.SETTINGS.ROOT) {
            const route = getSettingsRoute(status, idOfPolicyWithErrors);

            if (route) {
                Navigation.navigate(route);
            }
        }
    }, [selectedTab, chatTabBrickRoad]);

    if (!([SCREENS.HOME, SCREENS.SETTINGS.ROOT] as string[]).includes(selectedTab) || !indicator) {
        return null;
    }

    return (
        <View style={[StyleUtils.getBackgroundColorStyle(theme.cardBG), styles.p3, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
            <View style={[styles.flexRow, styles.gap2]}>
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={indicator}
                />
                <Text style={[styles.textWhite, styles.lh20]}>{message && translate(message)}</Text>
            </View>
            <Button
                text="View"
                onPress={navigateTo}
            />
        </View>
    );
};

export default DebugTabView;
