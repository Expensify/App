import TextLink from '@components/TextLink';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import React from 'react';

function TravelInvoicingLearnHow() {
    const {translate} = useLocalize();

    return <TextLink href={CONST.TRAVEL_INVOICING_HELP_URL}>{translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.learnHow')}</TextLink>;
}

export default TravelInvoicingLearnHow;
