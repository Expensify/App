import React from 'react';
import {Alert} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import Switch from '@components/Switch';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Console from '@libs/actions/Console';
import * as Troubleshoot from '@libs/actions/Troubleshoot';
import {parseStringifiedMessages} from '@libs/Console';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Log} from '@src/types/onyx';

type File = {
    path: string;
    newFileName: string;
    size: number;
};

type BaseRecordTroubleshootDataToolMenuProps = {
    /** Locally created file */
    file?: File;
    /** Action to run when pressing Share button */
    onShareLogs?: () => void;
    /** Action to run when disabling the switch */
    onDisableLogging: (logs: Log[]) => void;
    /** Action to run when enabling logging */
    onEnableLogging?: () => void;
    /** Path used to display location of saved file */
    displayPath?: string;
};

function BaseRecordTroubleshootDataToolMenu({file, onShareLogs, onDisableLogging, onEnableLogging, displayPath}: BaseRecordTroubleshootDataToolMenuProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [shouldRecordTroubleshootData] = useOnyx(ONYXKEYS.SHOULD_RECORD_TROUBLESHOOT_DATA, {canBeMissing: true});
    const [capturedLogs] = useOnyx(ONYXKEYS.LOGS, {canBeMissing: true});

    const onToggle = () => {
        if (!shouldRecordTroubleshootData) {
            Console.setShouldStoreLogs(true);
            Troubleshoot.setShouldRecordTroubleshootData(true);

            if (onEnableLogging) {
                onEnableLogging();
            }

            return;
        }

        if (!capturedLogs) {
            Alert.alert(translate('initialSettingsPage.troubleshoot.noLogsToShare'));
            Console.disableLoggingAndFlushLogs();
            Troubleshoot.setShouldRecordTroubleshootData(false);
            return;
        }

        const logs = Object.values(capturedLogs);
        const logsWithParsedMessages = parseStringifiedMessages(logs);

        onDisableLogging(logsWithParsedMessages);
        Console.disableLoggingAndFlushLogs();
        Troubleshoot.setShouldRecordTroubleshootData(false);
    };

    return (
        <>
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.recordTroubleshootData')}>
                <Switch
                    accessibilityLabel={translate('initialSettingsPage.troubleshoot.recordTroubleshootData')}
                    isOn={!!shouldRecordTroubleshootData}
                    onToggle={onToggle}
                />
            </TestToolRow>
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

BaseRecordTroubleshootDataToolMenu.displayName = 'BaseRecordTroubleshootDataToolMenu';

export type {File};
export default BaseRecordTroubleshootDataToolMenu;
