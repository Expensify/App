import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {isPolicyAdmin as isPolicyAdminPolicyUtils} from '@libs/PolicyUtils';
import {isCurrentUserSubmitter, isReportApproved, isReportManuallyReimbursed} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import RenderHTML from './RenderHTML';

type BrokenConnectionDescriptionProps = {
    /** Transaction id of the corresponding report */
    transactionID: string | undefined;

    /** Current report */
    report: OnyxEntry<Report>;

    /** Policy which the report is tied to */
    policy: OnyxEntry<Policy>;
};

function BrokenConnectionDescription({transactionID, policy, report}: BrokenConnectionDescriptionProps) {
    const {translate} = useLocalize();
    const transactionViolations = useTransactionViolations(transactionID);
    const {environmentURL} = useEnvironment();

    const brokenConnection530Error = transactionViolations?.find((violation) => violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530);
    const brokenConnectionError = transactionViolations?.find((violation) => violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION);
    const isPolicyAdmin = isPolicyAdminPolicyUtils(policy);
    const workspaceCompanyCardRoute = `${environmentURL}/${ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policy?.id)}`;

    if (!brokenConnection530Error && !brokenConnectionError) {
        return '';
    }

    if (brokenConnection530Error) {
        return translate('violations.brokenConnection530Error');
    }

    if (isPolicyAdmin && !isCurrentUserSubmitter(report)) {
        return <RenderHTML html={translate('violations.adminBrokenConnectionError', {workspaceCompanyCardRoute})} />;
    }

    if (isReportApproved({report}) || isReportManuallyReimbursed(report)) {
        return translate('violations.memberBrokenConnectionError');
    }

    return `${translate('violations.memberBrokenConnectionError')} ${translate('violations.markAsCashToIgnore')}`;
}

export default BrokenConnectionDescription;
