import TextLink from '@components/TextLink';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import React from 'react';

function TravelBillingLearnHow() {
    const {translate} = useLocalize();

    return (
        <TextLink
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TRAVEL.BILLING_LEARN_HOW_LINK}
            href={CONST.TRAVEL_BILLING_HELP_URL}
        >
            {translate('workspace.moreFeatures.travel.travelBilling.travelBillingSection.learnHow')}
        </TextLink>
    );
}

export default TravelBillingLearnHow;
