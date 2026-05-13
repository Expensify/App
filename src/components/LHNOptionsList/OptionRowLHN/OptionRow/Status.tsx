import React from 'react';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';

type StatusProps = {
    /** The option data for the report row. Status is only shown for 1:1 chats whose participant has set a status emoji. */
    optionItem: OptionData;
};

function Status({optionItem}: StatusProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const emojiCode = optionItem.status?.emojiCode ?? '';
    if (!emojiCode || !optionItem.isOneOnOneChat) {
        return null;
    }

    const statusText = optionItem.status?.text ?? '';
    const statusClearAfterDate = optionItem.status?.clearAfter ?? '';
    const currentSelectedTimezone = currentUserPersonalDetails?.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected;
    const formattedDate = DateUtils.getStatusUntilDate(translate, statusClearAfterDate, optionItem?.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected, currentSelectedTimezone);
    const statusContent = formattedDate ? `${statusText ? `${statusText} ` : ''}(${formattedDate})` : statusText;

    return (
        <Tooltip
            text={statusContent}
            shiftVertical={-4}
        >
            <Text style={styles.ml1}>{emojiCode}</Text>
        </Tooltip>
    );
}

Status.displayName = 'OptionRow.Status';

export default Status;
