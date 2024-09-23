import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DebugUtils from '@libs/DebugUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DebugParamList} from '@libs/Navigation/types';
import DebugDetails from '@pages/Debug/DebugDetails';
import DebugJSON from '@pages/Debug/DebugJSON';
import Debug from '@userActions/Debug';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import DebugReportActions from './DebugReportActions';

type DebugReportPageProps = PlatformStackScreenProps<DebugParamList, typeof SCREENS.DEBUG.REPORT>;

function DebugReportPage({
    route: {
        params: {reportID},
    },
}: DebugReportPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

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
                                />
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
