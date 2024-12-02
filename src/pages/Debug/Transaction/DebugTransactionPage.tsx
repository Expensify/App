import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Debug from '@libs/actions/Debug';
import DebugUtils from '@libs/DebugUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DebugParamList} from '@libs/Navigation/types';
import DebugDetails from '@pages/Debug/DebugDetails';
import DebugJSON from '@pages/Debug/DebugJSON';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import DebugTransactionViolations from './DebugTransactionViolations';

type DebugTransactionPageProps = PlatformStackScreenProps<DebugParamList, typeof SCREENS.DEBUG.TRANSACTION>;

function DebugTransactionPage({
    route: {
        params: {transactionID},
    },
}: DebugTransactionPageProps) {
    const {translate} = useLocalize();
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const styles = useThemeStyles();

    if (!transaction) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()}
            testID={DebugTransactionPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton
                        title={`${translate('debug.debug')} - ${translate('debug.transaction')}`}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <OnyxTabNavigator
                        id={CONST.TAB.DEBUG_TAB_ID}
                        tabBar={TabSelector}
                    >
                        <TopTab.Screen name={CONST.DEBUG.DETAILS}>
                            {() => (
                                <DebugDetails
                                    formType={CONST.DEBUG.FORMS.TRANSACTION}
                                    data={transaction}
                                    onSave={(data) => {
                                        Debug.setDebugData(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, data);
                                    }}
                                    onDelete={() => {
                                        Debug.setDebugData(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, null);
                                        Navigation.goBack();
                                    }}
                                    validate={DebugUtils.validateTransactionDraftProperty}
                                >
                                    <View style={[styles.mh5, styles.mb5]}>
                                        <Button
                                            text={translate('debug.viewReport')}
                                            onPress={() => {
                                                Navigation.navigate(ROUTES.DEBUG_REPORT.getRoute(transaction?.reportID ?? ''));
                                            }}
                                        />
                                    </View>
                                </DebugDetails>
                            )}
                        </TopTab.Screen>
                        <TopTab.Screen name={CONST.DEBUG.JSON}>{() => <DebugJSON data={transaction ?? {}} />}</TopTab.Screen>
                        <TopTab.Screen name={CONST.DEBUG.TRANSACTION_VIOLATIONS}>{() => <DebugTransactionViolations transactionID={transactionID} />}</TopTab.Screen>
                    </OnyxTabNavigator>
                </View>
            )}
        </ScreenWrapper>
    );
}

DebugTransactionPage.displayName = 'DebugTransactionPage';

export default DebugTransactionPage;
