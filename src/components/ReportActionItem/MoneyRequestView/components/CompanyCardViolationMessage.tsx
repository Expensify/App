import DotIndicatorMessage from '@components/DotIndicatorMessage';

import type {MoneyRequestViewData} from '../useMoneyRequestViewData';

type CompanyCardViolationMessageProps = {
    data: MoneyRequestViewData;
};

function CompanyCardViolationMessage({data}: CompanyCardViolationMessageProps) {
    return (
        <DotIndicatorMessage
            type="error"
            style={[data.styles.mv3, data.styles.mh4]}
            messages={{error: data.translate('violations.companyCardRequired')}}
        />
    );
}

CompanyCardViolationMessage.displayName = 'CompanyCardViolationMessage';

export default CompanyCardViolationMessage;
