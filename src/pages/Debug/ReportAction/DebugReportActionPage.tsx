import React, {useCallback, useMemo} from 'react';
import {InteractionManager, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DebugUtils from '@libs/DebugUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import type {DebugTabNavigatorRoutes} from '@libs/Navigation/DebugTabNavigator';
import DebugTabNavigator from '@libs/Navigation/DebugTabNavigator';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
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

type DebugReportActionPageProps = PlatformStackScreenProps<DebugParamList, typeof SCREENS.DEBUG.REPORT_ACTION>;

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

    const DebugDetailsTab = useCallback(
        () => (
            <DebugDetails
                formType={CONST.DEBUG.FORMS.REPORT_ACTION}
                data={reportAction}
                onSave={(data) => {
                    Debug.mergeDebugData(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[reportActionID]: data});
                }}
                onDelete={() => {
                    Navigation.goBack();
                    // We need to wait for navigation animations to finish before deleting an action,
                    // otherwise the user will see a not found page briefly.
                    InteractionManager.runAfterInteractions(() => {
                        Debug.mergeDebugData(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[reportActionID]: null});
                    });
                }}
                validate={DebugUtils.validateReportActionDraftProperty}
            >
                {!!transactionID && (
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
        ),
        [reportAction, reportActionID, reportID, styles.mb5, styles.mh5, transactionID, translate],
    );

    const DebugJSONTab = useCallback(() => <DebugJSON data={reportAction ?? {}} />, [reportAction]);

    const DebugReportActionPreviewTab = useCallback(() => <DebugReportActionPreview reportAction={reportAction} />, [reportAction]);

    const routes = useMemo<DebugTabNavigatorRoutes>(
        () => [
            {name: CONST.DEBUG.DETAILS, component: DebugDetailsTab},
            {name: CONST.DEBUG.JSON, component: DebugJSONTab},
            {name: CONST.DEBUG.REPORT_ACTION_PREVIEW, component: DebugReportActionPreviewTab},
        ],
        [DebugDetailsTab, DebugJSONTab, DebugReportActionPreviewTab],
    );

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
                    <DebugTabNavigator
                        id={CONST.TAB.DEBUG_TAB_ID}
                        routes={routes}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

DebugReportActionPage.displayName = 'DebugReportActionPage';

export default DebugReportActionPage;
