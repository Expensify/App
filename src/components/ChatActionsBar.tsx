import React from 'react';
import { View } from "react-native";
import * as Expensicons from './Icon/Expensicons';
import Button from "./Button";
import * as Report from '../libs/actions/Report';

function ChatActionsBar({report}) {
    const isPinned = !!report.isPinned;
    return (
        <View style={{flexDirection: 'row', paddingHorizontal: 14, marginBottom: 20}}>
            <View style={{flex: 1, paddingHorizontal: 6}}>
                <Button onPress={() => Report.leaveGroupChat(report.reportID)} icon={Expensicons.Exit} style={{flex: 1}} text="Leave" />
            </View>
            <View style={{flex: 1, paddingHorizontal: 6}}>
                <Button onPress={() => Report.togglePinnedState(report.reportID, isPinned)} icon={Expensicons.Pin} style={{flex: 1}} text={isPinned ? "Unpin" : "Pin"} />
            </View>
        </View>
    );
}

export default ChatActionsBar;
