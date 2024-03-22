import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import Switch from '@components/Switch';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ClientSideLoggingToolMenuOnyxProps} from './types';

type BaseClientSideLoggingToolMenuOnyxProps = Pick<ClientSideLoggingToolMenuOnyxProps, 'shouldStoreLogs'>;

type BaseClientSideLoggingToolProps = {
    file?: {path: string; newFileName: string; size: number};
    onShareLogs?: () => void;
    onToggleSwitch: () => void;
} & BaseClientSideLoggingToolMenuOnyxProps;

function BaseClientSideLoggingToolMenu({shouldStoreLogs, file, onShareLogs, onToggleSwitch}: BaseClientSideLoggingToolProps) {
    const styles = useThemeStyles();
    return (
        <>
            <TestToolRow title="Client side logging">
                <Switch
                    accessibilityLabel="Client side logging"
                    isOn={!!shouldStoreLogs}
                    onToggle={onToggleSwitch}
                />
            </TestToolRow>
            {!!file && (
                <>
                    <Text style={[styles.textLabelSupporting, styles.mb4]}>{`path: ${file.path}`}</Text>
                    <TestToolRow title="Logs">
                        <Button
                            small
                            text="Share"
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
    shouldStoreLogs: {
        key: ONYXKEYS.SHOULD_STORE_LOGS,
    },
})(BaseClientSideLoggingToolMenu);
