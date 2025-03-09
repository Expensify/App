import React from 'react';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
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
import ScrollView from './ScrollView';
import TestToolMenu from './TestToolMenu';
import TestToolRow from './TestToolRow';
import Text from './Text';

function TestToolsModal() {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [isTestToolsModalOpen = false] = useOnyx(ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN);
    const [shouldStoreLogs = false] = useOnyx(ONYXKEYS.SHOULD_STORE_LOGS);
    const {windowWidth} = useWindowDimensions();
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Modal
            isVisible={!!isTestToolsModalOpen}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CENTERED_SMALL}
            onClose={toggleTestToolsModal}
        >
            <ScrollView
                contentContainerStyle={[StyleUtils.getTestToolsModalStyle(windowWidth), isSmallScreenWidth && {...styles.w100, ...styles.pv0}]}
                style={[isSmallScreenWidth && styles.mh85vh]}
            >
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
                                Navigation.navigate(ROUTES.SETTINGS_CONSOLE.getRoute(Navigation.getActiveRoute()));
                            }}
                        />
                    </TestToolRow>
                )}
                <TestToolMenu />
            </ScrollView>
        </Modal>
    );
}

TestToolsModal.displayName = 'TestToolsModal';

export default TestToolsModal;
