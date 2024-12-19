import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToConciergeChatAndDeleteReport} from '@libs/actions/Report';
import DebugUtils from '@libs/DebugUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import type {DebugTabNavigatorRoutes} from '@libs/Navigation/DebugTabNavigator';
import DebugTabNavigator from '@libs/Navigation/DebugTabNavigator';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DebugParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import DebugDetails from '@pages/Debug/DebugDetails';
import DebugJSON from '@pages/Debug/DebugJSON';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import Debug from '@userActions/Debug';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import DebugReportActions from './DebugReportActions';

type DebugReportPageProps = PlatformStackScreenProps<DebugParamList, typeof SCREENS.DEBUG.REPORT>;

type Metadata = {
    title: string;
    subtitle: string;
    message?: string;
    action?: {
        name: string;
        callback: () => void;
    };
};

function DebugReportPage({
    route: {
        params: {reportID},
    },
}: DebugReportPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const transactionID = DebugUtils.getTransactionID(report, reportActions);

    const metadata = useMemo<Metadata[]>(() => {
        if (!report) {
            return [];
        }

        const shouldDisplayViolations = ReportUtils.shouldDisplayViolationsRBRInLHN(report, transactionViolations);
        const shouldDisplayReportViolations = ReportUtils.isReportOwner(report) && ReportUtils.hasReportViolations(reportID);
        const hasViolations = !!shouldDisplayViolations || shouldDisplayReportViolations;
        const {reason: reasonGBR, reportAction: reportActionGBR} = DebugUtils.getReasonAndReportActionForGBRInLHNRow(report) ?? {};
        const {reason: reasonRBR, reportAction: reportActionRBR} = DebugUtils.getReasonAndReportActionForRBRInLHNRow(report, reportActions, hasViolations) ?? {};
        const hasRBR = !!reasonRBR;
        const hasGBR = !hasRBR && !!reasonGBR;
        const reasonLHN = DebugUtils.getReasonForShowingRowInLHN(report, hasRBR);

        return [
            {
                title: translate('debug.visibleInLHN'),
                subtitle: translate(`debug.${!!reasonLHN}`),
                message: reasonLHN ? translate(reasonLHN) : undefined,
            },
            {
                title: translate('debug.GBR'),
                subtitle: translate(`debug.${hasGBR}`),
                message: hasGBR ? translate(reasonGBR) : undefined,
                action:
                    hasGBR && reportActionGBR
                        ? {
                              name: translate('common.view'),
                              callback: () =>
                                  Navigation.navigate(
                                      ROUTES.REPORT_WITH_ID.getRoute(
                                          reportActionGBR.childReportID ?? reportActionGBR.parentReportID ?? report.reportID,
                                          reportActionGBR.childReportID ? undefined : reportActionGBR.reportActionID,
                                      ),
                                  ),
                          }
                        : undefined,
            },
            {
                title: translate('debug.RBR'),
                subtitle: translate(`debug.${hasRBR}`),
                message: hasRBR ? translate(reasonRBR) : undefined,
                action:
                    hasRBR && reportActionRBR
                        ? {
                              name: translate('common.view'),
                              callback: () =>
                                  Navigation.navigate(
                                      ROUTES.REPORT_WITH_ID.getRoute(
                                          reportActionRBR.childReportID ?? reportActionRBR.parentReportID ?? report.reportID,
                                          reportActionRBR.childReportID ? undefined : reportActionRBR.reportActionID,
                                      ),
                                  ),
                          }
                        : undefined,
            },
        ];
    }, [report, reportActions, reportID, transactionViolations, translate]);

    const DebugDetailsTab = useCallback(
        () => (
            <DebugDetails
                formType={CONST.DEBUG.FORMS.REPORT}
                data={report}
                onSave={(data) => {
                    Debug.setDebugData(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, data);
                }}
                onDelete={() => {
                    navigateToConciergeChatAndDeleteReport(reportID, true, true);
                }}
                validate={DebugUtils.validateReportDraftProperty}
            >
                <View style={[styles.mb5, styles.ph5, styles.gap5]}>
                    {metadata?.map(({title, subtitle, message, action}) => (
                        <View style={[StyleUtils.getBackgroundColorStyle(theme.cardBG), styles.p5, styles.br4, styles.flexColumn, styles.gap2]}>
                            <View style={[styles.flexRow, styles.justifyContentBetween]}>
                                <Text style={styles.h4}>{title}</Text>
                                <Text>{subtitle}</Text>
                            </View>
                            {!!message && <Text style={styles.textSupporting}>{message}</Text>}
                            {!!action && (
                                <Button
                                    text={action.name}
                                    onPress={action.callback}
                                />
                            )}
                        </View>
                    ))}
                    <Button
                        text={translate('debug.viewReport')}
                        onPress={() => {
                            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
                        }}
                        icon={Expensicons.Eye}
                    />
                    {!!transactionID && (
                        <Button
                            text={translate('debug.viewTransaction')}
                            onPress={() => {
                                Navigation.navigate(ROUTES.DEBUG_TRANSACTION.getRoute(transactionID));
                            }}
                        />
                    )}
                </View>
            </DebugDetails>
        ),
        [
            StyleUtils,
            metadata,
            report,
            reportID,
            styles.br4,
            styles.flexColumn,
            styles.flexRow,
            styles.gap2,
            styles.gap5,
            styles.h4,
            styles.justifyContentBetween,
            styles.mb5,
            styles.p5,
            styles.ph5,
            styles.textSupporting,
            theme.cardBG,
            transactionID,
            translate,
        ],
    );

    const DebugJSONTab = useCallback(() => <DebugJSON data={report ?? {}} />, [report]);

    const DebugReportActionsTab = useCallback(() => <DebugReportActions reportID={reportID} />, [reportID]);

    const routes = useMemo<DebugTabNavigatorRoutes>(
        () => [
            {
                name: CONST.DEBUG.DETAILS,
                component: DebugDetailsTab,
            },
            {
                name: CONST.DEBUG.JSON,
                component: DebugJSONTab,
            },
            {
                name: CONST.DEBUG.REPORT_ACTIONS,
                component: DebugReportActionsTab,
            },
        ],
        [DebugDetailsTab, DebugJSONTab, DebugReportActionsTab],
    );

    if (!report) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()}
            testID={DebugReportPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton
                        title={`${translate('debug.debug')} - ${translate('debug.report')}`}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <DebugTabNavigator
                        id={CONST.DEBUG.FORMS.REPORT}
                        routes={routes}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

DebugReportPage.displayName = 'DebugReportPage';

export default DebugReportPage;
