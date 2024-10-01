import React, {memo, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import Text from '@components/Text';
import TextWithEllipsis from '@components/TextWithEllipsis';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';

type ReportTypingIndicatorProps = {
    reportID: string;
};

function ReportTypingIndicator({reportID}: ReportTypingIndicatorProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const [userTypingStatuses] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`);
    const styles = useThemeStyles();
    const usersTyping = useMemo(() => Object.keys(userTypingStatuses ?? {}).filter((loginOrAccountID) => userTypingStatuses?.[loginOrAccountID]), [userTypingStatuses]);
    const firstUserTyping = usersTyping.at(0);

    const isUserTypingADisplayName = Number.isNaN(Number(firstUserTyping));

    // If we are offline, the user typing statuses are not up-to-date so do not show them
    if (!!isOffline || !firstUserTyping) {
        return null;
    }

    // If the user is typing on OldDot, firstUserTyping will be a string (the user's displayName)
    const firstUserTypingDisplayName = isUserTypingADisplayName ? firstUserTyping : ReportUtils.getDisplayNameForParticipant(Number(firstUserTyping), false, false);

    if (usersTyping.length === 1) {
        return (
            <TextWithEllipsis
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
                leadingText={firstUserTypingDisplayName || translate('common.someone')}
                trailingText={` ${translate('reportTypingIndicator.isTyping')}`}
                textStyle={[styles.chatItemComposeSecondaryRowSubText]}
                wrapperStyle={[styles.chatItemComposeSecondaryRow, styles.flex1]}
                leadingTextParentStyle={styles.chatItemComposeSecondaryRowOffset}
            />
        );
    }
    return (
        <Text
            style={[styles.chatItemComposeSecondaryRowSubText, styles.chatItemComposeSecondaryRowOffset]}
            numberOfLines={1}
        >
            {translate('reportTypingIndicator.multipleUsers')}
            {` ${translate('reportTypingIndicator.areTyping')}`}
        </Text>
    );
}

ReportTypingIndicator.displayName = 'ReportTypingIndicator';

export default memo(ReportTypingIndicator);
