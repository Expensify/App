import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DebugUtils from '@libs/DebugUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import type {DebugParamList} from '@libs/Navigation/types';
import {getAllReportErrors} from '@libs/OptionsListUtils';
import DebugDetails from '@pages/Debug/DebugDetails';
import DebugJSON from '@pages/Debug/DebugJSON';
import Debug from '@userActions/Debug';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import DebugReportActions from './DebugReportActions';

type DebugReportPageProps = StackScreenProps<DebugParamList, typeof SCREENS.DEBUG.REPORT>;

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

    const metadata = useMemo<Metadata[]>(() => {
        if (!report) {
            return [];
        }

        const reasonLHN = DebugUtils.getReasonForShowingRowInLHN(report);
        const reasonGBR = DebugUtils.getReasonForShowingGreenDotInLHNRow(report);
        const reportActionGBR = DebugUtils.getGBRReportAction(report, reportActions);
        const reportActionRBR = DebugUtils.getRBRReportAction(report, reportActions);

        return [
            {
                title: 'Visible in LHN',
                subtitle: String(!!reasonLHN),
                message: reasonLHN ? translate(reasonLHN) : undefined,
            },
            {
                title: 'GBR',
                subtitle: String(!!reasonGBR),
                message: reasonGBR ? translate(reasonGBR) : undefined,
                action: reportActionGBR
                    ? {
                          name: 'View',
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
                title: 'RBR',
                subtitle: String(!isEmptyObject(getAllReportErrors(report, reportActions))),
                action: reportActionRBR
                    ? {
                          name: 'View cause',
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
    }, [report, reportActions, translate]);

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
                    <OnyxTabNavigator
                        id={CONST.TAB.DEBUG_TAB_ID}
                        tabBar={TabSelector}
                    >
                        <TopTab.Screen name={CONST.DEBUG.DETAILS}>
                            {() => (
                                <DebugDetails
                                    data={report}
                                    onSave={(data) => {
                                        Debug.mergeDebugData(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, data);
                                    }}
                                    onDelete={() => {
                                        Debug.mergeDebugData(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, null);
                                    }}
                                    validate={DebugUtils.validateReportDraftProperty}
                                >
                                    {metadata?.map(({title, subtitle, message, action}) => (
                                        <View style={[StyleUtils.getBackgroundColorStyle(theme.cardBG), styles.p5, styles.br4, styles.flexColumn, styles.gap2]}>
                                            <View style={[styles.flexRow, styles.justifyContentBetween]}>
                                                <Text style={styles.h4}>{title}</Text>
                                                <Text>{subtitle}</Text>
                                            </View>
                                            {message && <Text style={styles.textSupporting}>{message}</Text>}
                                            {action && (
                                                <Button
                                                    text={action.name}
                                                    onPress={action.callback}
                                                />
                                            )}
                                        </View>
                                    ))}
                                </DebugDetails>
                            )}
                        </TopTab.Screen>
                        <TopTab.Screen name={CONST.DEBUG.JSON}>{() => <DebugJSON data={report ?? {}} />}</TopTab.Screen>
                        <TopTab.Screen name={CONST.DEBUG.REPORT_ACTIONS}>{() => <DebugReportActions reportID={reportID} />}</TopTab.Screen>
                    </OnyxTabNavigator>
                </View>
            )}
        </ScreenWrapper>
    );
}

DebugReportPage.displayName = 'DebugReportPage';

export default DebugReportPage;
