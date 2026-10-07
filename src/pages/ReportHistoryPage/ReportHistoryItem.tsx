import Icon from '@components/Icon';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import React from 'react';
import {View} from 'react-native';

import type {ReportHistoryAction, ReportHistoryStep} from './types';

import {REPORT_HISTORY_ACTION} from './types';

type ReportHistoryItemProps = {
    step: ReportHistoryStep;
};

const COMPLETED_LABELS: Record<ReportHistoryAction, TranslationPaths> = {
    [REPORT_HISTORY_ACTION.CREATED]: 'reportHistoryPage.created',
    [REPORT_HISTORY_ACTION.SUBMITTED]: 'reportHistoryPage.submitted',
    [REPORT_HISTORY_ACTION.APPROVED]: 'reportHistoryPage.approved',
    [REPORT_HISTORY_ACTION.REROUTED]: 'reportHistoryPage.rerouted',
    [REPORT_HISTORY_ACTION.HELD]: 'reportHistoryPage.held',
    [REPORT_HISTORY_ACTION.PAID]: 'reportHistoryPage.paid',
};

const UPCOMING_LABELS: Partial<Record<ReportHistoryAction, TranslationPaths>> = {
    [REPORT_HISTORY_ACTION.SUBMITTED]: 'reportHistoryPage.toSubmit',
    [REPORT_HISTORY_ACTION.APPROVED]: 'reportHistoryPage.toApprove',
    [REPORT_HISTORY_ACTION.PAID]: 'reportHistoryPage.toPay',
};

function ReportHistoryItem({step}: ReportHistoryItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, formatPhoneNumber} = useLocalize();
    const [personalDetail] = usePersonalDetail(step.accountID);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentSelectedTimezone = currentUserPersonalDetails?.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected;
    const icons = useMemoizedLazyExpensifyIcons(['Receipt', 'Send', 'ThumbsUp', 'ArrowRight', 'Stopwatch', 'MoneyBag']);

    const actionIcons = {
        [REPORT_HISTORY_ACTION.CREATED]: icons.Receipt,
        [REPORT_HISTORY_ACTION.SUBMITTED]: icons.Send,
        [REPORT_HISTORY_ACTION.APPROVED]: icons.ThumbsUp,
        [REPORT_HISTORY_ACTION.REROUTED]: icons.ArrowRight,
        [REPORT_HISTORY_ACTION.HELD]: icons.Stopwatch,
        [REPORT_HISTORY_ACTION.PAID]: icons.MoneyBag,
    };

    const displayName = temporaryGetDisplayNameOrDefault({
        passedPersonalDetails: personalDetail,
        translate,
        formatPhoneNumber,
    });
    const label = step.isCompleted ? COMPLETED_LABELS[step.action] : (UPCOMING_LABELS[step.action] ?? COMPLETED_LABELS[step.action]);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, !step.isCompleted && styles.opacitySemiTransparent]}>
            <View style={styles.reportHistoryIconContainer}>
                <Icon
                    src={actionIcons[step.action]}
                    height={variables.iconSizeSemiSmall}
                    width={variables.iconSizeSemiSmall}
                    fill={theme.icon}
                />
            </View>
            <Text style={[styles.flex1, styles.ml3]}>
                <Text style={styles.textStrong}>{displayName}</Text> {translate(label)}
            </Text>
            {!!step.created && <Text style={[styles.textMicroSupporting, styles.ml2]}>{DateUtils.datetimeToShortRelative(translate, step.created, currentSelectedTimezone)}</Text>}
        </View>
    );
}

export default ReportHistoryItem;
