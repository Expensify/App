import {render, screen} from '@testing-library/react-native';

import Text from '@components/Text';

import withUnifiedConnectionsBeta from '@pages/workspace/connections/withUnifiedConnectionsBeta';

import React from 'react';

let mockIsUnifiedConnectionsBetaEnabled = false;
jest.mock('@hooks/useIsUnifiedConnectionsBetaEnabled', () => ({
    __esModule: true,
    default: () => mockIsUnifiedConnectionsBetaEnabled,
}));

jest.mock('@pages/workspace/connections/WorkspaceConnectionsPage', () => {
    const {default: MockText} = jest.requireActual<{default: typeof Text}>('@components/Text');
    return {
        __esModule: true,
        default: () => <MockText>Connections page</MockText>,
    };
});

function OldIntegrationPage({label}: {label: string}) {
    return <Text>{label}</Text>;
}

const OldIntegrationPageWithBeta = withUnifiedConnectionsBeta(OldIntegrationPage);

describe('withUnifiedConnectionsBeta', () => {
    it('should render the wrapped page while the beta is off', () => {
        // Given a user without the unified Connections beta
        mockIsUnifiedConnectionsBetaEnabled = false;

        // When an old integration page renders
        render(<OldIntegrationPageWithBeta label="Accounting page" />);

        // Then the old page shows as before, since only beta users moved to Connections
        expect(screen.getByText('Accounting page')).toBeOnTheScreen();
        expect(screen.queryByText('Connections page')).not.toBeOnTheScreen();
    });

    it('should render the Connections page in its place while the beta is on', () => {
        // Given a user with the unified Connections beta
        mockIsUnifiedConnectionsBetaEnabled = true;

        // When an old link opens an integration page
        render(<OldIntegrationPageWithBeta label="Accounting page" />);

        // Then Connections shows instead, since the old page is no longer in the workspace menu for this user
        expect(screen.getByText('Connections page')).toBeOnTheScreen();
        expect(screen.queryByText('Accounting page')).not.toBeOnTheScreen();
    });
});
