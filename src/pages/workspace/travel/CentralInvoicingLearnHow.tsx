import React from 'react';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';

function CentralInvoicingLearnHow() {
    const {translate} = useLocalize();

    return <TextLink href={CONST.FOOTER.TRAVEL_URL}>{translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.learnHow')}</TextLink>;
}

export default CentralInvoicingLearnHow;
