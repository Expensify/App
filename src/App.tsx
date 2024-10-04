import React, {useEffect} from 'react';
import {LogBox, TextInput, View} from 'react-native';
import '../wdyr';
import BaseTextInput from './components/TextInput/BaseTextInput';
import CONFIG from './CONFIG';
import BootSplash from './libs/BootSplash';
import type {Route} from './ROUTES';

type AppProps = {
    /** URL passed to our top-level React Native component by HybridApp. Will always be undefined in "pure" NewDot builds. */
    url?: Route;
};

LogBox.ignoreLogs([
    // Basically it means that if the app goes in the background and back to foreground on Android,
    // the timer is lost. Currently Expensify is using a 30 minutes interval to refresh personal details.
    // More details here: https://git.io/JJYeb
    'Setting a timer for a long period of time',
]);

const fill = {flex: 1};

const StrictModeWrapper = CONFIG.USE_REACT_STRICT_MODE_IN_DEV ? React.StrictMode : ({children}: {children: React.ReactElement}) => children;

// function App({url}: AppProps) {
//     useDefaultDragAndDrop();
//     OnyxUpdateManager();

//     return (
//         <StrictModeWrapper>
//             <SplashScreenStateContextProvider>
//                 <InitialURLContextProvider url={url}>
//                     <GestureHandlerRootView style={fill}>
//                         <ComposeProviders
//                             components={[
//                                 OnyxProvider,
//                                 ThemeProvider,
//                                 ThemeStylesProvider,
//                                 ThemeIllustrationsProvider,
//                                 SafeAreaProvider,
//                                 PortalProvider,
//                                 SafeArea,
//                                 LocaleContextProvider,
//                                 HTMLEngineProvider,
//                                 KeyboardStateProvider,
//                                 PopoverContextProvider,
//                                 CurrentReportIDContextProvider,
//                                 ScrollOffsetContextProvider,
//                                 ReportAttachmentsProvider,
//                                 PickerStateProvider,
//                                 EnvironmentProvider,
//                                 CustomStatusBarAndBackgroundContextProvider,
//                                 ActiveElementRoleProvider,
//                                 ActiveWorkspaceContextProvider,
//                                 ReportIDsContextProvider,
//                                 PlaybackContextProvider,
//                                 FullScreenContextProvider,
//                                 VolumeContextProvider,
//                                 VideoPopoverMenuContextProvider,
//                                 KeyboardProvider,
//                                 SearchRouterContextProvider,
//                             ]}
//                         >
//                             <CustomStatusBarAndBackground />
//                             <ErrorBoundary errorMessage="NewExpensify crash caught by error boundary">
//                                 <ColorSchemeWrapper>
//                                     <Expensify />
//                                 </ColorSchemeWrapper>
//                             </ErrorBoundary>
//                         </ComposeProviders>
//                     </GestureHandlerRootView>
//                 </InitialURLContextProvider>
//             </SplashScreenStateContextProvider>
//         </StrictModeWrapper>
//     );
// }

function App() {
    useEffect(() => {
        BootSplash.hide();
    }, []);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
            }}
        >
            <BaseTextInput
                autoFocus
                autoGrow={false}
                placeholder="0"
                containerStyles={{
                    alignSelf: 'center',
                }}
                inputStyle={{
                    width: undefined,
                    minWidth: undefined,
                    alignSelf: 'center',
                    flex: 0,
                    backgroundColor: 'orange',
                }}
                // inputStyle={{
                //     width: 200,
                // }}
                // defaultValue="1123"
                // containerStyles={{
                //     backgroundColor: 'red',
                //     alignSelf: 'center',
                // }}
            />

            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}
            >
                <View
                    style={{
                        width: 25,
                        height: 25,
                        backgroundColor: 'purple',
                    }}
                />
                <TextInput
                    accessibilityLabel="Text input field"
                    placeholder="RN"
                    style={{
                        alignSelf: 'center',
                        backgroundColor: 'green',
                    }}
                />
            </View>
        </View>
    );
}

App.displayName = 'App';

export default App;
