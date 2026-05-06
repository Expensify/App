import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import DisplayNames from '@components/DisplayNames';
import {useLHNTooltipContext} from '@components/LHNOptionsList/LHNTooltipContext';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import type {OptionData} from '@libs/ReportUtils';
import {isChatUsedForOnboarding as isChatUsedForOnboardingReportUtils, isGroupChat, isOneOnOneChat, isSystemChat} from '@libs/ReportUtils';
import FreeTrial from '@pages/settings/Subscription/FreeTrial';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type OptionRowTitleWithStatusProps = {
    /** Option row data used for the title, tooltips, and status emoji */
    optionItem: OptionData;

    /** Report backing this row (drives group/system checks and status visibility) */
    report?: Report;

    /** Styles applied to the primary display name */
    displayNameStyle: StyleProp<TextStyle>;

    /** Row test id forwarded to DisplayNames */
    testID: number;
};

function OptionRowTitleWithStatus({optionItem, report, displayNameStyle, testID}: OptionRowTitleWithStatusProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {onboarding, onboardingPurpose} = useLHNTooltipContext();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isChatUsedForOnboarding = isChatUsedForOnboardingReportUtils(report, onboarding, conciergeReportID, onboardingPurpose);

    const emojiCode = optionItem.status?.emojiCode ?? '';
    const isStatusVisible = !!emojiCode && isOneOnOneChat(!isEmptyObject(report) ? report : undefined);

    const statusText = optionItem.status?.text ?? '';
    const statusClearAfterDate = optionItem.status?.clearAfter ?? '';
    const currentSelectedTimezone = currentUserPersonalDetails?.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected;
    const formattedDate = isStatusVisible
        ? DateUtils.getStatusUntilDate(translate, statusClearAfterDate, optionItem?.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected, currentSelectedTimezone)
        : '';
    const statusContent = formattedDate ? `${statusText ? `${statusText} ` : ''}(${formattedDate})` : statusText;

    const shouldParseFullTitle = optionItem?.parentReportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT && !isGroupChat(report);
    const shouldUseFullTitle =
        !!optionItem.isChatRoom ||
        !!optionItem.isPolicyExpenseChat ||
        !!optionItem.isTaskReport ||
        !!optionItem.isThread ||
        !!optionItem.isMoneyRequestReport ||
        !!optionItem.isInvoiceReport ||
        !!optionItem.private_isArchived ||
        isGroupChat(report) ||
        isSystemChat(report);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mw100, styles.overflowHidden]}>
            <DisplayNames
                accessibilityLabel={translate('accessibilityHints.chatUserDisplayNames')}
                fullTitle={optionItem.text ?? ''}
                shouldParseFullTitle={shouldParseFullTitle}
                displayNamesWithTooltips={optionItem.displayNamesWithTooltips ?? []}
                tooltipEnabled
                numberOfLines={1}
                textStyles={displayNameStyle}
                shouldUseFullTitle={shouldUseFullTitle}
                testID={testID}
            />
            {isChatUsedForOnboarding && <FreeTrial badgeStyles={[styles.mnh0, styles.pl2, styles.pr2, styles.ml1, styles.flexShrink1]} />}
            {isStatusVisible && (
                <Tooltip
                    text={statusContent}
                    shiftVertical={-4}
                >
                    <Text style={styles.ml1}>{emojiCode}</Text>
                </Tooltip>
            )}
        </View>
    );
}

OptionRowTitleWithStatus.displayName = 'OptionRowTitleWithStatus';

export default OptionRowTitleWithStatus;
