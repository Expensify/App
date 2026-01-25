import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToConciergeChatAndDeleteReport} from '@libs/actions/Report';
import DebugUtils from '@libs/DebugUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import type {DebugTabNavigatorRoutes} from '@libs/Navigation/DebugTabNavigator';
import DebugTabNavigator from '@libs/Navigation/DebugTabNavigator';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DebugParamList} from '@libs/Navigation/types';
import {hasReportViolations, isReportOwner, shouldDisplayViolationsRBRInLHN} from '@libs/ReportUtils';
import DebugDetails from '@pages/Debug/DebugDetails';
import DebugJSON from '@pages/Debug/DebugJSON';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import Debug from '@userActions/Debug';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';
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
    const icons = useMemoizedLazyExpensifyIcons(['Eye'] as const);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`, {canBeMissing: true});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canBeMissing: true});
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const reportAttributesSelector = useCallback((attributes: OnyxEntry<ReportAttributesDerivedValue>) => attributes?.reports?.[reportID], [reportID]);
    const [reportAttributes] = useOnyx(
        ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
        {
            selector: reportAttributesSelector,
            canBeMissing: true,
        },
        [reportAttributesSelector],
    );
    const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, {canBeMissing: true});
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {canBeMissing: true});
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const transactionID = DebugUtils.getTransactionID(report, reportActions);
    const isReportArchived = useReportIsArchived(reportID);

    const metadata = useMemo<Metadata[]>(() => {
        if (!report) {
            return [];
        }

        const shouldDisplayViolations = shouldDisplayViolationsRBRInLHN(report, transactionViolations);
        const shouldDisplayReportViolations = isReportOwner(report) && hasReportViolations(reportID);
        const hasViolations = !!shouldDisplayViolations || shouldDisplayReportViolations;
        const {reason: reasonGBR, reportAction: reportActionGBR} = DebugUtils.getReasonAndReportActionForGBRInLHNRow(report, isReportArchived) ?? {};
        const {reason: reasonRBR, reportAction: reportActionRBR} =
            DebugUtils.getReasonAndReportActionForRBRInLHNRow(
                report,
                chatReport,
                reportActions,
                transactions,
                transactionViolations,
                hasViolations,
                reportAttributes?.reportErrors ?? {},
                isReportArchived,
            ) ?? {};
        const hasRBR = !!reasonRBR;
        const hasGBR = !hasRBR && !!reasonGBR;
        const reasonLHN = DebugUtils.getReasonForShowingRowInLHN({
            report,
            chatReport,
            betas,
            doesReportHaveViolations: shouldDisplayViolations,
            hasRBR,
            isReportArchived,
            isInFocusMode: priorityMode === CONST.PRIORITY_MODE.GSD,
            draftComment,
        });

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
    }, [report, transactionViolations, reportID, isReportArchived, chatReport, reportActions, transactions, reportAttributes?.reportErrors, betas, priorityMode, draftComment, translate]);

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
                        <View
                            key={title}
                            style={[StyleUtils.getBackgroundColorStyle(theme.cardBG), styles.p5, styles.br4, styles.flexColumn, styles.gap2]}
                        >
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
                        icon={icons.Eye}
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
            icons.Eye,
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
            shouldEnableMinHeight={canUseTouchScreen()}
            testID="DebugReportPage"
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

export default DebugReportPage;
