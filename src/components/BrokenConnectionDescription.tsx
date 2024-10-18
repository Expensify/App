import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import TextLink from './TextLink';

type BrokenConnectionDescriptionProps = {
    /** Transaction id of the corresponding report */
    transactionID: string;

    /** Current report */
    report: OnyxEntry<Report>;

    /** Policy which the report is tied to */
    policy: OnyxEntry<Policy>;
};

function BrokenConnectionDescription({transactionID, policy, report}: BrokenConnectionDescriptionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);

    const brokenConnection530Error = transactionViolations?.find((violation) => violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530);
    const brokenConnectionError = transactionViolations?.find((violation) => violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION);
    const isPolicyAdmin = PolicyUtils.isPolicyAdmin(policy);

    if (!brokenConnection530Error && !brokenConnectionError) {
        return '';
    }

    if (brokenConnection530Error) {
        return translate('violations.brokenConnection530Error');
    }

    if (isPolicyAdmin && !ReportUtils.isCurrentUserSubmitter(report?.reportID ?? '')) {
        return (
            <>
                {`${translate('violations.adminBrokenConnectionError')}`}
                <TextLink
                    style={[styles.textLabelSupporting, styles.link]}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policy?.id ?? '-1'))}
                >{`${translate('workspace.common.companyCards')}`}</TextLink>
                .
            </>
        );
    }

    if (ReportUtils.isReportApproved(report) || ReportUtils.isReportManuallyReimbursed(report) || (ReportUtils.isProcessingReport(report) && !PolicyUtils.isInstantSubmitEnabled(policy))) {
        return translate('violations.memberBrokenConnectionError');
    }

    return `${translate('violations.memberBrokenConnectionError')} ${translate('violations.markAsCashToIgnore')}`;
}

BrokenConnectionDescription.displayName = 'BrokenConnectionDescription';

export default BrokenConnectionDescription;
