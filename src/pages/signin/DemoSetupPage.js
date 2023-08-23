import React from 'react';
import SignInPage from './SignInPage';
import useLocalize from '../../hooks/useLocalize';

function DemoSetupPage() {
    const {translate} = useLocalize();
    return <SignInPage customHeadline={translate('login.hero.demoHeadline')} />;
}

DemoSetupPage.displayName = 'DemoSetupPage';

export default DemoSetupPage;
