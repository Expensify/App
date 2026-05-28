import React from 'react';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';

function TravelInvoicingLearnHow() {
    const {translate} = useLocalize();

    return <TextLink href={CONST.FOOTER.TRAVEL_URL}>{translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.learnHow')}</TextLink>;
}

export default TravelInvoicingLearnHow;
