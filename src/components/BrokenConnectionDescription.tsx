import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useTransactionViolations from '@hooks/useTransactionViolations';

import {isPolicyAdmin as isPolicyAdminPolicyUtils} from '@libs/PolicyUtils';
import {isCurrentUserSubmitter, isReportApproved, isReportManuallyReimbursed} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

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
    const brokenConnectionReauthError = transactionViolations?.find((violation) => violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_REAUTH);
    const brokenConnectionError = transactionViolations?.find((violation) => violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION);
    const isPolicyAdmin = isPolicyAdminPolicyUtils(policy);
    const workspaceCompanyCardRoute = `${environmentURL}/${ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policy?.id)}`;

    if (!brokenConnection530Error && !brokenConnectionReauthError && !brokenConnectionError) {
        return '';
    }

    if (brokenConnection530Error) {
        return translate('violations.brokenConnection530Error');
    }

    const isReauth = !!brokenConnectionReauthError;
    const adminErrorKey = isReauth ? 'violations.adminReauthConnectionError' : 'violations.adminBrokenConnectionError';
    const memberErrorKey = isReauth ? 'violations.memberReauthConnectionError' : 'violations.memberBrokenConnectionError';

    if (isPolicyAdmin && !isCurrentUserSubmitter(report)) {
        return <RenderHTML html={translate(adminErrorKey, {workspaceCompanyCardRoute})} />;
    }

    if (isReportApproved({report}) || isReportManuallyReimbursed(report)) {
        return translate(memberErrorKey);
    }

    return `${translate(memberErrorKey)} ${translate('violations.markAsCashToIgnore')}`;
}

export default BrokenConnectionDescription;
