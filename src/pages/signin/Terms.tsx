import React from 'react';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';

function Terms() {
    const {translate} = useLocalize();

    return <RenderHTML html={`<muted-text>${translate('termsOfUse.terms')}</muted-text>`} />;
}

Terms.displayName = 'Terms';

export default Terms;
