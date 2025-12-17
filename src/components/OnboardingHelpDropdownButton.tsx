import {accountIDSelector} from '@selectors/Session';
import {addMinutes} from 'date-fns';
import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {openExternalLink} from '@libs/actions/Link';
import {cancelBooking, clearBookingDraft, rescheduleBooking} from '@libs/actions/ScheduleCall';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportNameValuePairs} from '@src/types/onyx';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption, OnboardingHelpType} from './ButtonWithDropdownMenu/types';
// eslint-disable-next-line no-restricted-imports
import {Close} from './Icon/Expensicons';

type OnboardingHelpButtonProps = {
    /** The ID of onboarding chat report */
    reportID: string | undefined;

    /** Whether we should display the Onboarding help button as in narrow layout */
    shouldUseNarrowLayout: boolean;

    /** Should show Register for webinar option */
    shouldShowRegisterForWebinar: boolean;

    /** Should show Guide booking option */
    shouldShowGuideBooking: boolean;

    /** Has user active Schedule call with guide */
    hasActiveScheduledCall: boolean | undefined;
};

const reportNameValuePartsSelector = (reportNameValuePairs?: ReportNameValuePairs) => reportNameValuePairs?.calendlyCalls?.at(-1);

function OnboardingHelpDropdownButton({reportID, shouldUseNarrowLayout, shouldShowRegisterForWebinar, shouldShowGuideBooking, hasActiveScheduledCall}: OnboardingHelpButtonProps) {
    const {translate} = useLocalize();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector, canBeMissing: false});

    const [latestScheduledCall] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
        selector: reportNameValuePartsSelector,
        canBeMissing: true,
    });

    const styles = useThemeStyles();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const userTimezone = currentUserPersonalDetails?.timezone?.selected ? currentUserPersonalDetails?.timezone.selected : CONST.DEFAULT_TIME_ZONE.selected;

    const icons = useMemoizedLazyExpensifyIcons(['CalendarSolid', 'Monitor']);
    const illustrations = useMemoizedLazyIllustrations(['HeadSet']);

    if (!reportID || !accountID) {
        return null;
    }

    const options: Array<DropdownOption<OnboardingHelpType>> = [];

    if (!hasActiveScheduledCall && shouldShowGuideBooking) {
        options.push({
            text: translate('getAssistancePage.scheduleACall'),
            icon: icons.CalendarSolid,
            value: CONST.ONBOARDING_HELP.SCHEDULE_CALL,
            onSelected: () => {
                clearBookingDraft();
                Navigation.navigate(ROUTES.SCHEDULE_CALL_BOOK.getRoute(reportID));
            },
        });
    }

    if (hasActiveScheduledCall && latestScheduledCall) {
        options.push({
            text: `${DateUtils.formatInTimeZoneWithFallback(latestScheduledCall.eventTime, userTimezone, CONST.DATE.WEEKDAY_TIME_FORMAT)}, ${DateUtils.formatInTimeZoneWithFallback(
                latestScheduledCall.eventTime,
                userTimezone,
                CONST.DATE.MONTH_DAY_YEAR_FORMAT,
            )}`,
            value: CONST.ONBOARDING_HELP.EVENT_TIME,
            description: `${DateUtils.formatInTimeZoneWithFallback(latestScheduledCall.eventTime, userTimezone, CONST.DATE.LOCAL_TIME_FORMAT)} - ${DateUtils.formatInTimeZoneWithFallback(
                addMinutes(latestScheduledCall.eventTime, 30),
                userTimezone,
                CONST.DATE.LOCAL_TIME_FORMAT,
            )} ${DateUtils.getZoneAbbreviation(new Date(latestScheduledCall.eventTime), userTimezone)}`,
            descriptionTextStyle: [styles.themeTextColor, styles.ml2],
            displayInDefaultIconColor: true,
            icon: illustrations.HeadSet,
            iconWidth: variables.avatarSizeLargeNormal,
            iconHeight: variables.avatarSizeLargeNormal,
            wrapperStyle: [styles.mb3, styles.pl4, styles.pr5, styles.pt3, styles.pb6, styles.borderBottom],
            interactive: false,
            titleStyle: styles.ml2,
            avatarSize: CONST.AVATAR_SIZE.LARGE_NORMAL,
        });
        options.push({
            text: translate('common.reschedule'),
            value: CONST.ONBOARDING_HELP.RESCHEDULE,
            onSelected: () => rescheduleBooking(latestScheduledCall),
            icon: icons.CalendarSolid,
        });
        options.push({
            text: translate('common.cancel'),
            value: CONST.ONBOARDING_HELP.CANCEL,
            onSelected: () => cancelBooking(latestScheduledCall),
            icon: Close,
        });
    }

    if (shouldShowRegisterForWebinar) {
        options.push({
            text: translate('getAssistancePage.registerForWebinar'),
            icon: icons.Monitor,
            shouldShowButtonRightIcon: true,
            value: CONST.ONBOARDING_HELP.REGISTER_FOR_WEBINAR,
            onSelected: () => {
                openExternalLink(CONST.REGISTER_FOR_WEBINAR_URL);
            },
        });
    }

    if (options.length === 0) {
        return null;
    }

    return (
        <ButtonWithDropdownMenu
            onPress={(_event, value) => {
                const option = options.find((opt) => opt.value === value);
                option?.onSelected?.();
            }}
            pressOnEnter
            success={!!hasActiveScheduledCall}
            buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
            options={options}
            shouldUseOptionIcon
            isSplitButton={false}
            customText={hasActiveScheduledCall ? translate('scheduledCall.callScheduled') : translate('getAssistancePage.onboardingHelp')}
            wrapperStyle={shouldUseNarrowLayout && styles.earlyDiscountButton}
        />
    );
}

export default OnboardingHelpDropdownButton;
