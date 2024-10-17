import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DebugUtils from '@libs/DebugUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import type {DebugParamList} from '@libs/Navigation/types';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import DebugDetails from '@pages/Debug/DebugDetails';
import DebugJSON from '@pages/Debug/DebugJSON';
import Debug from '@userActions/Debug';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import DebugReportActionPreview from './DebugReportActionPreview';

type DebugReportActionPageProps = StackScreenProps<DebugParamList, typeof SCREENS.DEBUG.REPORT_ACTION>;

function DebugReportActionPage({
    route: {
        params: {reportID, reportActionID},
    },
}: DebugReportActionPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [reportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
        selector: (reportActions) => reportActions?.[reportActionID],
    });
    const transactionID = ReportActionsUtils.getLinkedTransactionID(reportAction);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()}
            testID={DebugReportActionPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton
                        title={`${translate('debug.debug')} - ${translate('debug.reportAction')}`}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <OnyxTabNavigator
                        id={CONST.TAB.DEBUG_TAB_ID}
                        tabBar={TabSelector}
                    >
                        <TopTab.Screen name={CONST.DEBUG.DETAILS}>
                            {() => (
                                <DebugDetails
                                    data={reportAction}
                                    onSave={(data) => {
                                        Debug.mergeDebugData(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[reportActionID]: data});
                                    }}
                                    onDelete={() => {
                                        Debug.mergeDebugData(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[reportActionID]: null});
                                    }}
                                    validate={DebugUtils.validateReportActionDraftProperty}
                                >
                                    {transactionID && (
                                        <View style={[styles.mh5, styles.mb5]}>
                                            <Button
                                                text={translate('debug.viewTransaction')}
                                                onPress={() => {
                                                    Navigation.navigate(ROUTES.DEBUG_TRANSACTION.getRoute(transactionID));
                                                }}
                                            />
                                        </View>
                                    )}
                                </DebugDetails>
                            )}
                        </TopTab.Screen>
                        <TopTab.Screen name={CONST.DEBUG.JSON}>{() => <DebugJSON data={reportAction ?? {}} />}</TopTab.Screen>
                        <TopTab.Screen name={CONST.DEBUG.REPORT_ACTION_PREVIEW}>{() => <DebugReportActionPreview reportAction={reportAction} />}</TopTab.Screen>
                    </OnyxTabNavigator>
                </View>
            )}
        </ScreenWrapper>
    );
}

DebugReportActionPage.displayName = 'DebugReportActionPage';

export default DebugReportActionPage;
