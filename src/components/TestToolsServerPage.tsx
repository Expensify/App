import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TestToolsModalModalNavigatorParamList} from '@libs/Navigation/types';

import ServerSelector from '@pages/settings/Troubleshoot/ServerSelector';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import TestToolsScreenWrapper from './TestToolsScreenWrapper';

type TestToolsServerPageProps = PlatformStackScreenProps<TestToolsModalModalNavigatorParamList, typeof SCREENS.TEST_TOOLS_MODAL.SERVER>;

function TestToolsServerPage({route}: TestToolsServerPageProps) {
    return (
        <TestToolsScreenWrapper>
            <ServerSelector backToRoute={ROUTES.TEST_TOOLS_MODAL.getRoute(route.params?.backTo)} />
        </TestToolsScreenWrapper>
    );
}

export default TestToolsServerPage;
