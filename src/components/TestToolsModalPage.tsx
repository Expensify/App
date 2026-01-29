import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import useIsAuthenticated from '@hooks/useIsAuthenticated';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import Navigation from '@navigation/Navigation';
import type {TestToolsModalModalNavigatorParamList} from '@navigation/types';
import toggleTestToolsModal from '@userActions/TestTool';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import Button from './Button';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import RecordTroubleshootDataToolMenu from './RecordTroubleshootDataToolMenu';
import SafeAreaConsumer from './SafeAreaConsumer';
import ScrollView from './ScrollView';
import TestToolMenu from './TestToolMenu';
import TestToolRow from './TestToolRow';
import Text from './Text';

function getRouteBasedOnAuthStatus(isAuthenticated: boolean, activeRoute?: string) {
    return isAuthenticated ? ROUTES.SETTINGS_CONSOLE.getRoute(activeRoute) : ROUTES.PUBLIC_CONSOLE_DEBUG.getRoute(activeRoute);
}

function TestToolsModalPage() {
    const {windowHeight} = useWindowDimensions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute<PlatformStackRouteProp<TestToolsModalModalNavigatorParamList, typeof SCREENS.TEST_TOOLS_MODAL.ROOT>>();
    const backTo = route.params?.backTo;
    const [shouldStoreLogs = false] = useOnyx(ONYXKEYS.SHOULD_STORE_LOGS, {canBeMissing: true});
    const isAuthenticated = useIsAuthenticated();

    // If no backTo param is provided (direct access to /test-tools),
    // use home route as a default backTo param for console navigation
    const effectiveBackTo = backTo ?? ROUTES.INBOX;
    const consoleRoute = getRouteBasedOnAuthStatus(isAuthenticated, effectiveBackTo);

    const maxHeight = windowHeight;

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[{maxHeight}, styles.h100, styles.defaultModalContainer, safeAreaPaddingBottomStyle]}>
                    <ScrollView
                        style={[styles.flex1, styles.ph5]}
                        contentContainerStyle={styles.flexGrow1}
                    >
                        <PressableWithoutFeedback
                            accessible={false}
                            style={[styles.cursorDefault]}
                        >
                            <Text
                                style={[styles.textLabelSupporting, styles.mt5, styles.mb3]}
                                numberOfLines={1}
                            >
                                {translate('initialSettingsPage.troubleshoot.releaseOptions')}
                            </Text>
                            <RecordTroubleshootDataToolMenu />
                            {!!shouldStoreLogs && (
                                <TestToolRow title={translate('initialSettingsPage.troubleshoot.debugConsole')}>
                                    <Button
                                        small
                                        text={translate('initialSettingsPage.debugConsole.viewConsole')}
                                        onPress={() => {
                                            // Close the test tools modal first, then navigate to console page
                                            toggleTestToolsModal();
                                            navigateAfterInteraction(() => {
                                                Navigation.navigate(consoleRoute);
                                            });
                                        }}
                                    />
                                </TestToolRow>
                            )}
                            <TestToolMenu />
                        </PressableWithoutFeedback>
                    </ScrollView>
                </View>
            )}
        </SafeAreaConsumer>
    );
}

export default TestToolsModalPage;
