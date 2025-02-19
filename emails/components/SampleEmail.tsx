import React from 'react';
import EmailWrapper from '../components/EmailWrapper';

const SampleEmail: React.FC = () => {
    return (
        <EmailWrapper>
            <h1>Welcome to Expensify!</h1>
            <p>We're glad to have you on board.</p>
        </EmailWrapper>
    );
};

export default SampleEmail;
