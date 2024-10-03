import React, {useEffect, useRef, useState} from 'react';
import type {AppStateStatus} from 'react-native';
import {AppState, Image, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as TransactionEdit from '@libs/actions/TransactionEdit';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ShareActionHandlerModule from '@src/modules/ShareActionHandlerModule';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ShareTab from './ShareTab';
import SubmitTab from './SubmitTab';

type ShareRootPageOnyxProps = {
    selectedTab: OnyxEntry<string>;
};

type ShareRootPageProps = ShareRootPageOnyxProps;

function ShareRootPage() {
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`);
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const fileIsScannable = false;
    const [imageURIs, setImageURIs] = useState<string[]>([]);
    const appState = useRef(AppState.currentState);

    const handleProcessFiles = () => {
        console.log('PROCESS FILES ATTEMPT');
        ShareActionHandlerModule.processFiles((processedFiles) => {
            // eslint-disable-next-line no-console
            console.log('PROCESSED FILES ', processedFiles);
            setImageURIs(processedFiles);
        });
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
            handleProcessFiles();
        }
        appState.current = nextAppState;
    };

    useEffect(() => {
        const changeSubscription = AppState.addEventListener('change', handleAppStateChange);
        TransactionEdit.createDraftTransaction(transaction);

        handleProcessFiles();

        return () => {
            changeSubscription.remove();
            TransactionEdit.removeDraftTransaction(transaction?.transactionID ?? '-1');
        };
    }, []);

    console.log('transaction test ', transaction);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()}
            testID={ShareRootPage.displayName}
        >
            <View style={[styles.flex1]}>
                <HeaderWithBackButton
                    title={translate('iou.shareRoot.shareToExpensify')}
                    shouldShowBackButton
                />
                {/* {imageURIs.map((uri) => (
                    <Image
                        key={`image-${uri}`}
                        source={{uri}} // Note the change here
                        style={{width: 100, height: 100}}
                    />
                ))} */}
                <OnyxTabNavigator
                    id={CONST.TAB.SHARE.NAVIGATOR_ID}
                    // @ts-expect-error I think that OnyxTabNavigator is going to be refactored in terms of types
                    // selectedTab={fileIsScannable && selectedTab ? selectedTab : CONST.TAB.SHARE}
                    selectedTab={CONST.TAB.SHARE}
                    hideTabBar={!fileIsScannable}
                    tabBar={TabSelector}
                >
                    <TopTab.Screen name={CONST.TAB.SHARE.SHARE}>{() => <ShareTab transaction={transaction} />}</TopTab.Screen>
                    <TopTab.Screen name={CONST.TAB.SHARE.SUBMIT}>{() => <SubmitTab />}</TopTab.Screen>
                </OnyxTabNavigator>
            </View>
        </ScreenWrapper>
    );
}

ShareRootPage.displayName = 'ShareRootPage';

export default ShareRootPage;
