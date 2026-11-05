import RenderHTML from '@components/RenderHTML';

import useLocalize from '@hooks/useLocalize';

import React from 'react';

/** The "I accept the Expensify Terms of Service" text beside a consent checkbox, with the terms linked */
function TermsOfServiceLabel() {
    const {translate} = useLocalize();
    return <RenderHTML html={translate('common.acceptTermsOfService')} />;
}

export default TermsOfServiceLabel;
