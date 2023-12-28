import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import ChildrenProps from '@src/types/utils/ChildrenProps';

type ReportActionItemBasicMessageProps = ChildrenProps & {
    message: string;
};

function ReportActionItemBasicMessage({message, children}: ReportActionItemBasicMessageProps) {
    const styles = useThemeStyles();
    return (
        <View>
            <Text style={[styles.chatItemMessage, styles.colorMuted]}>{message}</Text>
            {children}
        </View>
    );
}

ReportActionItemBasicMessage.displayName = 'ReportActionBasicMessage';

export default ReportActionItemBasicMessage;
