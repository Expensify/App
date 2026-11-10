import React from 'react';
import {View} from 'react-native';

import Text from './Text';

type ClaudeReviewTestNoticeProps = {
    remainingDays: number;
};

function ClaudeReviewTestNotice({remainingDays}: ClaudeReviewTestNoticeProps) {
    if (remainingDays > 14) {
        return null;
    }

    return (
        <View>
            <Text>Your trial ends in {remainingDays} days</Text>
        </View>
    );
}

export default ClaudeReviewTestNotice;
