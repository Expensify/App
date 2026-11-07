import useLocalize from '@hooks/useLocalize';

import React from 'react';

import RenderHTML from './RenderHTML';

/** "I accept the Expensify Terms of Service", with the terms as a link, for a checkbox the user ticks before adding a bank account */
function TermsOfServiceLabel() {
    const {translate} = useLocalize();
    return <RenderHTML html={translate('common.acceptTermsOfService')} />;
}

export default TermsOfServiceLabel;
