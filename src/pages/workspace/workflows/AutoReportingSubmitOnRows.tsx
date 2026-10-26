/**
 * The "Submit on" rows of the Frequency RHP, which open the day pickers for the selected submission frequency.
 */
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {AutoReportingFrequency} from '@libs/SubmissionScheduleUtils';
import {getAutoReportingOffsetDisplayName, getWeekdayKey} from '@libs/SubmissionScheduleUtils';

import {clearPolicyErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {AutoReportingOffset} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type SectionHeaderProps = {
    /** The section title */
    title: string;
};

function SectionHeader({title}: SectionHeaderProps) {
    const styles = useThemeStyles();
    return (
        <Text
            variant="labelStrong"
            style={[styles.ph5, styles.pv1Half, styles.mt6]}
        >
            {title}
        </Text>
    );
}

type AutoReportingOffsetRowProps = {
    /** The row label */
    name: string;

    /** The day shown in the row */
    value: string;

    /** Opens the day picker */
    onPress: () => void;

    /** The pending action of the saved day */
    pendingAction?: PendingAction | null;

    /** Errors from the last save of the day */
    errors?: Errors;

    /** Dismisses the errors */
    onCloseError?: () => void;

    /** Sentry label of the row */
    sentryLabel: string;
};

function AutoReportingOffsetRow({name, value, onPress, pendingAction, errors, onCloseError, sentryLabel}: AutoReportingOffsetRowProps) {
    const styles = useThemeStyles();
    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            errors={errors}
            onClose={onCloseError}
            errorRowStyles={[styles.ph5]}
        >
            <MenuItemField
                name={name}
                value={value}
                onPress={onPress}
                sentryLabel={sentryLabel}
            />
        </OfflineWithFeedback>
    );
}

type AutoReportingSubmitOnRowsProps = {
    /** The policy whose schedule is being edited */
    policy: OnyxEntry<Policy>;

    /** The frequency selected in the Frequency RHP */
    frequency: AutoReportingFrequency | undefined;

    /** Whether the selected frequency is the saved one, so the rows show the saved days */
    isSavedFrequencySelected: boolean;

    /** The selected day */
    offset: AutoReportingOffset | undefined;

    /** The selected second twice a month day */
    secondOffset: AutoReportingOffset | undefined;
};

function AutoReportingSubmitOnRows({policy, frequency, isSavedFrequencySelected, offset, secondOffset}: AutoReportingSubmitOnRowsProps) {
    const {translate, toLocaleOrdinal} = useLocalize();
    const policyID = policy?.id;

    // The pending state belongs to the saved days, so it only applies while the rows show them
    const offsetPendingAction = isSavedFrequencySelected ? policy?.pendingFields?.autoReportingOffset : undefined;
    const secondOffsetPendingAction = isSavedFrequencySelected ? policy?.pendingFields?.autoReportingOffsetSecondSemiMonthly : undefined;
    const offsetErrors = getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_OFFSET);
    const clearOffsetErrors = () => clearPolicyErrorField(policyID, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_OFFSET);

    switch (frequency) {
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY:
            return (
                <>
                    <SectionHeader title={translate('workflowsPage.submitOn')} />
                    <AutoReportingOffsetRow
                        name={translate('workflowsPage.dayOfTheWeek')}
                        value={translate(`workflowsPage.daysOfWeek.${getWeekdayKey(Number(offset))}`)}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_WEEKLY_OFFSET.getRoute(policyID))}
                        pendingAction={offsetPendingAction}
                        errors={offsetErrors}
                        onCloseError={clearOffsetErrors}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.AUTO_REPORTING_OFFSET}
                    />
                </>
            );
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY:
            return (
                <>
                    <SectionHeader title={translate('workflowsPage.firstSubmission')} />
                    <AutoReportingOffsetRow
                        name={translate('workflowsPage.dayOfTheMonth')}
                        value={getAutoReportingOffsetDisplayName(offset, translate, toLocaleOrdinal)}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_SEMI_MONTHLY_OFFSET.getRoute(policyID, CONST.POLICY.SEMI_MONTHLY_SUBMISSIONS.FIRST))}
                        pendingAction={offsetPendingAction}
                        errors={offsetErrors}
                        onCloseError={clearOffsetErrors}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.AUTO_REPORTING_OFFSET}
                    />
                    <SectionHeader title={translate('workflowsPage.secondSubmission')} />
                    <AutoReportingOffsetRow
                        name={translate('workflowsPage.dayOfTheMonth')}
                        value={getAutoReportingOffsetDisplayName(secondOffset, translate, toLocaleOrdinal)}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_SEMI_MONTHLY_OFFSET.getRoute(policyID, CONST.POLICY.SEMI_MONTHLY_SUBMISSIONS.SECOND))}
                        pendingAction={secondOffsetPendingAction}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.AUTO_REPORTING_SECOND_OFFSET}
                    />
                </>
            );
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY:
            return (
                <>
                    <SectionHeader title={translate('workflowsPage.submitOn')} />
                    <AutoReportingOffsetRow
                        name={translate('workflowsPage.dayOfTheMonth')}
                        value={getAutoReportingOffsetDisplayName(offset, translate, toLocaleOrdinal)}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_MONTHLY_OFFSET.getRoute(policyID))}
                        pendingAction={offsetPendingAction}
                        errors={offsetErrors}
                        onCloseError={clearOffsetErrors}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.AUTO_REPORTING_OFFSET}
                    />
                </>
            );
        default:
            return null;
    }
}

export default AutoReportingSubmitOnRows;
