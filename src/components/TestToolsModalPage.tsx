import React from 'react';
import {View} from 'react-native';
import useIsAuthenticated from '@hooks/useIsAuthenticated';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import Button from './Button';
import RecordTroubleshootDataToolMenu from './RecordTroubleshootDataToolMenu';
import SafeAreaConsumer from './SafeAreaConsumer';
import ScrollView from './ScrollView';
import TestToolMenu from './TestToolMenu';
import TestToolRow from './TestToolRow';
import Text from './Text';

function getRouteBasedOnAuthStatus(isAuthenticated: boolean, activeRoute: string) {
    return isAuthenticated ? ROUTES.SETTINGS_CONSOLE.getRoute(activeRoute) : ROUTES.PUBLIC_CONSOLE_DEBUG.getRoute(activeRoute);
}

function TestToolsModalPage() {
    const {windowHeight} = useWindowDimensions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const activeRoute = Navigation.getActiveRoute();
    const [shouldStoreLogs = false] = useOnyx(ONYXKEYS.SHOULD_STORE_LOGS, {canBeMissing: true});
    const isAuthenticated = useIsAuthenticated();
    const route = getRouteBasedOnAuthStatus(isAuthenticated, activeRoute);

    const maxHeight = windowHeight;

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[{maxHeight}, styles.h100, styles.defaultModalContainer, safeAreaPaddingBottomStyle]}>
                    <ScrollView style={[styles.flex1, styles.flexGrow1, styles.ph5]}>
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
                                        Navigation.navigate(route);
                                    }}
                                />
                            </TestToolRow>
                        )}
                        <TestToolMenu />
                    </ScrollView>
                </View>
            )}
        </SafeAreaConsumer>
    );
}

TestToolsModalPage.displayName = 'TestToolsModalPage';

export default TestToolsModalPage;
