import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useIsAuthenticated from '@hooks/useIsAuthenticated';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@navigation/Navigation';
import toggleTestToolsModal from '@userActions/TestTool';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import Button from './Button';
import ClientSideLoggingToolMenu from './ClientSideLoggingToolMenu';
import Modal from './Modal';
import ProfilingToolMenu from './ProfilingToolMenu';
import TestToolMenu from './TestToolMenu';
import TestToolRow from './TestToolRow';
import Text from './Text';

function getRouteBasedOnAuthStatus(isAuthenticated: boolean, activeRoute: string) {
    return isAuthenticated ? ROUTES.SETTINGS_CONSOLE.getRoute(activeRoute) : ROUTES.PUBLIC_CONSOLE_DEBUG.getRoute(activeRoute);
}

function TestToolsModal() {
    const [isTestToolsModalOpen = false] = useOnyx(ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN);
    const [shouldStoreLogs = false] = useOnyx(ONYXKEYS.SHOULD_STORE_LOGS);
    const {windowWidth} = useWindowDimensions();
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const activeRoute = Navigation.getActiveRoute();
    const isAuthenticated = useIsAuthenticated();
    const route = getRouteBasedOnAuthStatus(isAuthenticated, activeRoute);

    return (
        <Modal
            isVisible={!!isTestToolsModalOpen}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_SMALL}
            onClose={toggleTestToolsModal}
        >
            <View style={[StyleUtils.getTestToolsModalStyle(windowWidth)]}>
                <Text
                    style={[styles.textLabelSupporting, styles.mt4, styles.mb3]}
                    numberOfLines={1}
                >
                    {translate('initialSettingsPage.troubleshoot.releaseOptions')}
                </Text>
                <ProfilingToolMenu />
                <ClientSideLoggingToolMenu />
                {!!shouldStoreLogs && (
                    <TestToolRow title={translate('initialSettingsPage.troubleshoot.debugConsole')}>
                        <Button
                            small
                            text={translate('initialSettingsPage.debugConsole.viewConsole')}
                            onPress={() => {
                                toggleTestToolsModal();
                                Navigation.navigate(route);
                            }}
                        />
                    </TestToolRow>
                )}
                <TestToolMenu />
            </View>
        </Modal>
    );
}

TestToolsModal.displayName = 'TestToolsModal';

export default TestToolsModal;
