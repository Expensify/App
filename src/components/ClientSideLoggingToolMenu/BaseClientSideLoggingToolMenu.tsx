import React from 'react';
import {Alert} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import Switch from '@components/Switch';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Console from '@libs/actions/Console';
import {parseStringifiedMessages} from '@libs/Console';
import Navigation from '@navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CapturedLogs, Log} from '@src/types/onyx';

type BaseClientSideLoggingToolMenuOnyxProps = {
    /** Logs captured on the current device */
    capturedLogs: OnyxEntry<CapturedLogs>;

    /** Whether or not logs should be stored */
    shouldStoreLogs: OnyxEntry<boolean>;
};

type BaseClientSideLoggingToolProps = {
    /** Locally created file */
    file?: {path: string; newFileName: string; size: number};
    /** Action to run when pressing Share button */
    onShareLogs?: () => void;
    /** Action to run when disabling the switch */
    onDisableLogging: (logs: Log[]) => void;
    /** Action to run when enabling logging */
    onEnableLogging?: () => void;
    /** Path used to display location of saved file */
    displayPath?: string;
    /** Boolean to know if this was opened via test tools modal */
    isViaTestToolsModal: boolean;
    /** Action to close the test tools modal */
    closeTestToolsModal?: () => void;
} & BaseClientSideLoggingToolMenuOnyxProps;

function BaseClientSideLoggingToolMenu({
    shouldStoreLogs,
    capturedLogs,
    file,
    onShareLogs,
    onDisableLogging,
    onEnableLogging,
    displayPath,
    isViaTestToolsModal,
    closeTestToolsModal,
}: BaseClientSideLoggingToolProps) {
    const {translate} = useLocalize();

    const onToggle = () => {
        if (!shouldStoreLogs) {
            Console.setShouldStoreLogs(true);

            if (onEnableLogging) {
                onEnableLogging();
            }

            return;
        }

        if (!capturedLogs) {
            Alert.alert(translate('initialSettingsPage.troubleshoot.noLogsToShare'));
            Console.disableLoggingAndFlushLogs();
            return;
        }

        const logs = Object.values(capturedLogs);
        const logsWithParsedMessages = parseStringifiedMessages(logs);

        onDisableLogging(logsWithParsedMessages);
        Console.disableLoggingAndFlushLogs();
    };
    const styles = useThemeStyles();

    return (
        <>
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.clientSideLogging')}>
                <Switch
                    accessibilityLabel={translate('initialSettingsPage.troubleshoot.clientSideLogging')}
                    isOn={!!shouldStoreLogs}
                    onToggle={onToggle}
                />
            </TestToolRow>
            {!!shouldStoreLogs && isViaTestToolsModal && (
                <TestToolRow title={translate('initialSettingsPage.troubleshoot.debugConsole')}>
                    <Button
                        small
                        text={translate('initialSettingsPage.debugConsole.viewConsole')}
                        onPress={() => {
                            if (closeTestToolsModal) {
                                closeTestToolsModal();
                            }
                            Navigation.navigate(ROUTES.SETTINGS_CONSOLE.getRoute(isViaTestToolsModal));
                        }}
                    />
                </TestToolRow>
            )}
            {!!file && (
                <>
                    <Text style={[styles.textLabelSupporting, styles.mb4]}>{`path: ${displayPath}`}</Text>
                    <TestToolRow title={translate('initialSettingsPage.debugConsole.logs')}>
                        <Button
                            small
                            text={translate('common.share')}
                            onPress={onShareLogs}
                        />
                    </TestToolRow>
                </>
            )}
        </>
    );
}

BaseClientSideLoggingToolMenu.displayName = 'BaseClientSideLoggingToolMenu';

export default withOnyx<BaseClientSideLoggingToolProps, BaseClientSideLoggingToolMenuOnyxProps>({
    capturedLogs: {
        key: ONYXKEYS.LOGS,
    },
    shouldStoreLogs: {
        key: ONYXKEYS.SHOULD_STORE_LOGS,
    },
})(BaseClientSideLoggingToolMenu);
