import React from 'react';
import SignInPage from './SignInPage';

function DemoSetupPage() {
    return (
        <SignInPage customHeadline="Welcome to SaaStr!
        Hop in to start networking now."/>
    );
}

DemoSetupPage.displayName = 'SignInPage';

export default DemoSetupPage;
