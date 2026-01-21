import React from 'react';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';

function CentralInvoicingLearnHow() {
    const {translate} = useLocalize();

    return (
        <>
            {' '}
            <RenderHTML html={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.learnHow')} />
        </>
    );
}

export default CentralInvoicingLearnHow;
