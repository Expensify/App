import React, {useEffect, useRef, useState} from 'react';
import type {AppStateStatus} from 'react-native';
import {AppState, Image, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@navigation/Navigation';
import ShareActionHandlerModule from '@src/modules/ShareActionHandlerModule';

type ShareRootPageOnyxProps = {
    selectedTab: OnyxEntry<string>;
};

type ShareRootPageProps = ShareRootPageOnyxProps;

function ShareRootPage() {
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

        handleProcessFiles();

        return () => {
            changeSubscription.remove();
        };
    }, []);

    const navigateBack = () => {
        Navigation.dismissModal();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()}
            testID={ShareRootPage.displayName}
        >
            <View style={[styles.flex1]}>
                <HeaderWithBackButton
                    title="Share"
                    onBackButtonPress={navigateBack}
                />
                {imageURIs.map((uri) => (
                    <Image
                        key={`image-${uri}`}
                        source={{uri}} // Note the change here
                        style={{width: 100, height: 100}}
                    />
                ))}
                {/* <OnyxTabNavigator
                    id={CONST.TAB.SHARE_TAB_ID}
                    // @ts-expect-error I think that OnyxTabNavigator is going to be refactored in terms of types
                    selectedTab={fileIsScannable && selectedTab ? selectedTab : CONST.TAB.SHARE}
                    hideTabBar={!fileIsScannable}
                    // @ts-expect-error I think that OnyxTabNavigator is going to be refactored in terms of types
                    tabBar={({state, navigation, position}) => (
                        <TabSelector
                            state={state}
                            navigation={navigation}
                            position={position}
                        />
                    )}
                >
                    <TopTab.Screen name={CONST.TAB.SHARE}>{() => <ShareTab />}</TopTab.Screen>
                    <TopTab.Screen name={CONST.TAB.SCAN}>{() => <ScanTab />}</TopTab.Screen>
                </OnyxTabNavigator> */}
            </View>
        </ScreenWrapper>
    );
}

ShareRootPage.displayName = 'ShareRootPage';

export default ShareRootPage;
