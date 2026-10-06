import {fireEvent, render, screen} from '@testing-library/react-native';

import type ConnectionLayout from '@components/ConnectionLayout';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';

import BusinessCentralImportPage from '@pages/workspace/accounting/businessCentral/import/BusinessCentralImportPage';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import type {ToggleSettingOptionRowProps} from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import React from 'react';

import createMock from '../../utils/createMock';

const POLICY_ID = '123';
const mockShowConfirmModal = jest.fn();
const MockPressable = PressableWithoutFeedback;
const MockText = Text;
let mockPolicy: Policy;

jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: mockShowConfirmModal}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@libs/actions/connections/BusinessCentral');
jest.mock(
    '@components/ConnectionLayout',
    () =>
        ({children}: React.ComponentProps<typeof ConnectionLayout>) =>
            children,
);
jest.mock('@pages/workspace/withPolicyConnections', () => (WrappedComponent: React.ComponentType<WithPolicyConnectionsProps>) => {
    function MockPolicyConnections({route}: Pick<WithPolicyConnectionsProps, 'route'>) {
        return (
            <WrappedComponent
                policy={mockPolicy}
                policyDraft={undefined}
                isLoadingPolicy={false}
                route={route}
            />
        );
    }

    return MockPolicyConnections;
});
jest.mock('@pages/workspace/workflows/ToggleSettingsOptionRow', () => ({isActive, onToggle, disabled, disabledAction, switchAccessibilityLabel}: ToggleSettingOptionRowProps) => (
    <MockPressable
        accessibilityRole="button"
        accessibilityLabel={switchAccessibilityLabel}
        onPress={() => {
            if (disabled) {
                disabledAction?.();
                return;
            }

            onToggle(!isActive);
        }}
    >
        <MockText>{switchAccessibilityLabel}</MockText>
    </MockPressable>
));

function renderImportPage() {
    return render(<BusinessCentralImportPage route={createMock<WithPolicyConnectionsProps['route']>({params: {policyID: POLICY_ID}})} />);
}

describe('BusinessCentralImportPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPolicy = createMock<Policy>({
            id: POLICY_ID,
            connections: {
                businessCentral: {
                    config: {
                        coding: {
                            customerMappings: {
                                customers: CONST.BUSINESS_CENTRAL_MAPPING_VALUE.NONE,
                                projects: CONST.BUSINESS_CENTRAL_MAPPING_VALUE.NONE,
                            },
                        },
                        export: {
                            reimbursable: CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION.JOURNAL_ENTRY,
                            nonReimbursable: CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION.JOURNAL_ENTRY,
                        },
                    },
                    data: {
                        dimensions: [],
                    },
                },
            },
        });
    });

    it.each(['workspace.businessCentral.customers', 'workspace.businessCentral.projects'])('shows the Purchase Invoice explanation when locked %s is pressed', (mappingLabel) => {
        // Given Customer and Project imports are locked because both export destinations are General Journal.
        renderImportPage();

        // When the locked mapping row is pressed.
        fireEvent.press(screen.getByRole('button', {name: mappingLabel}));

        // Then the admin sees why Purchase Invoice export is required instead of changing the mapping.
        expect(mockShowConfirmModal).toHaveBeenCalledWith({
            title: 'workspace.businessCentral.projectsAndCustomersCannotBeEnabled',
            prompt: 'workspace.businessCentral.projectsAndCustomersCannotBeEnabledDescription',
            confirmText: 'common.buttonConfirm',
            shouldShowCancelButton: false,
        });
    });
});
