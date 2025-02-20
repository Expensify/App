import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {isInstantSubmitEnabled, isPolicyAdmin as isPolicyAdminPolicyUtils} from '@libs/PolicyUtils';
import {isCurrentUserSubmitter, isProcessingReport, isReportApproved, isReportManuallyReimbursed} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import TextLink from './TextLink';

type BrokenConnectionDescriptionProps = {
    /** Transaction id of the corresponding report */
    transactionID: string | undefined;

    /** Current report */
    report: OnyxEntry<Report>;

    /** Policy which the report is tied to */
    policy: OnyxEntry<Policy>;
};

function BrokenConnectionDescription({transactionID, policy, report}: BrokenConnectionDescriptionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const transactionViolations = useTransactionViolations(transactionID);

    const brokenConnection530Error = transactionViolations?.find((violation) => violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530);
    const brokenConnectionError = transactionViolations?.find((violation) => violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION);
    const isPolicyAdmin = isPolicyAdminPolicyUtils(policy);

    if (!brokenConnection530Error && !brokenConnectionError) {
        return '';
    }

    if (brokenConnection530Error) {
        return translate('violations.brokenConnection530Error');
    }

    if (isPolicyAdmin && !isCurrentUserSubmitter(report?.reportID)) {
        return (
            <>
                {`${translate('violations.adminBrokenConnectionError')}`}
                <TextLink
                    style={[styles.textLabelSupporting, styles.link]}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policy?.id))}
                >{`${translate('workspace.common.companyCards')}`}</TextLink>
                .
            </>
        );
    }

    if (isReportApproved({report}) || isReportManuallyReimbursed(report) || (isProcessingReport(report) && !isInstantSubmitEnabled(policy))) {
        return translate('violations.memberBrokenConnectionError');
    }

    return `${translate('violations.memberBrokenConnectionError')} ${translate('violations.markAsCashToIgnore')}`;
}

BrokenConnectionDescription.displayName = 'BrokenConnectionDescription';

export default BrokenConnectionDescription;
