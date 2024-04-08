import React from 'react';
import {View} from 'react-native';
import * as Report from '@userActions/Report';
import useLocalize from '@hooks/useLocalize';
import Button from './Button';
import * as Expensicons from './Icon/Expensicons';

function ChatActionsBar({report}) {
    const {translate} = useLocalize();
    const isPinned = !!report.isPinned;
    return (
        <View style={{flexDirection: 'row', paddingHorizontal: 14, marginBottom: 20}}>
            <View style={{flex: 1, paddingHorizontal: 6}}>
                <Button
                    onPress={() => Report.leaveGroupChat(report.reportID)}
                    icon={Expensicons.Exit}
                    style={{flex: 1}}
                    text={translate('common.leave')}
                />
            </View>
            <View style={{flex: 1, paddingHorizontal: 6}}>
                <Button
                    onPress={() => Report.togglePinnedState(report.reportID, isPinned)}
                    icon={Expensicons.Pin}
                    style={{flex: 1}}
                    text={isPinned ? translate('common.unPin') : translate('common.pin')}
                />
            </View>
        </View>
    );
}

ChatActionsBar.displayName = 'ChatActionsBar';

export default ChatActionsBar;
