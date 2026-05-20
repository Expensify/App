import React from 'react';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import {useAllViolations as useAllSnapshotViolations} from '@components/MoneyRequestView/contexts/SnapshotViolationsProvider';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function TransactionViolationsBlockSnapshot() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const violations = useAllSnapshotViolations();

    const hasRequiredCompanyCardViolation = violations.some((violation) => violation.name === CONST.VIOLATIONS.COMPANY_CARD_REQUIRED);

    if (!hasRequiredCompanyCardViolation) {
        return null;
    }

    return (
        <DotIndicatorMessage
            type="error"
            style={[styles.mv3, styles.mh4]}
            messages={{error: translate('violations.companyCardRequired')}}
        />
    );
}

export default TransactionViolationsBlockSnapshot;
