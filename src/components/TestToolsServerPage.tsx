import ServerSelector from '@pages/settings/Troubleshoot/ServerSelector';

import React from 'react';

import TestToolsScreenWrapper from './TestToolsScreenWrapper';

function TestToolsServerPage() {
    return (
        <TestToolsScreenWrapper>
            <ServerSelector />
        </TestToolsScreenWrapper>
    );
}

export default TestToolsServerPage;
