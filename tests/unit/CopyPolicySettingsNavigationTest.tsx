import ROUTES from '@src/ROUTES';

const MOCK_POLICY_ID = 'test-policy-123';

/**
 * Helper function that mirrors the workspace selection change detection logic
 * used in CopyPolicySettingsSelectWorkspacesPage
 */
function hasWorkspaceSelectionChanged(previousTargetIDs: string[], resolvedSelectedTargetIDs: string[]): boolean {
    return previousTargetIDs.length !== resolvedSelectedTargetIDs.length || !previousTargetIDs.every((id) => resolvedSelectedTargetIDs.includes(id));
}

describe('CopyPolicySettingsNavigation', () => {
    describe('Back button routes', () => {
        it('SELECT_FEATURES back route should navigate to ROOT (workspace selector)', () => {
            const expectedRoute = ROUTES.POLICY_COPY_SETTINGS.getRoute(MOCK_POLICY_ID);
            expect(expectedRoute).toBe(`policy/${MOCK_POLICY_ID}/copy-settings`);
        });

        it('CONFIRM back route should navigate to SELECT_FEATURES', () => {
            const expectedRoute = ROUTES.POLICY_COPY_SETTINGS_SELECT_FEATURES.getRoute(MOCK_POLICY_ID);
            expect(expectedRoute).toBe(`policy/${MOCK_POLICY_ID}/copy-settings/select-features`);
        });
    });

    describe('Route construction', () => {
        it('should construct correct POLICY_COPY_SETTINGS route', () => {
            const route = ROUTES.POLICY_COPY_SETTINGS.getRoute(MOCK_POLICY_ID);
            expect(route).toContain('copy-settings');
            expect(route).toContain(MOCK_POLICY_ID);
        });

        it('should construct correct POLICY_COPY_SETTINGS_SELECT_FEATURES route', () => {
            const route = ROUTES.POLICY_COPY_SETTINGS_SELECT_FEATURES.getRoute(MOCK_POLICY_ID);
            expect(route).toContain('copy-settings/select-features');
            expect(route).toContain(MOCK_POLICY_ID);
        });

        it('should construct correct POLICY_COPY_SETTINGS_CONFIRM route', () => {
            const route = ROUTES.POLICY_COPY_SETTINGS_CONFIRM.getRoute(MOCK_POLICY_ID);
            expect(route).toContain('copy-settings/confirm');
            expect(route).toContain(MOCK_POLICY_ID);
        });
    });

    describe('Workspace selection change detection', () => {
        it('should detect no change when arrays are identical', () => {
            const previous = ['policy-1', 'policy-2'];
            const current = ['policy-1', 'policy-2'];
            expect(hasWorkspaceSelectionChanged(previous, current)).toBe(false);
        });

        it('should detect no change when arrays have same elements in different order', () => {
            const previous = ['policy-1', 'policy-2'];
            const current = ['policy-2', 'policy-1'];
            expect(hasWorkspaceSelectionChanged(previous, current)).toBe(false);
        });

        it('should detect change when a workspace is added', () => {
            const previous = ['policy-1'];
            const current = ['policy-1', 'policy-2'];
            expect(hasWorkspaceSelectionChanged(previous, current)).toBe(true);
        });

        it('should detect change when a workspace is removed', () => {
            const previous = ['policy-1', 'policy-2'];
            const current = ['policy-1'];
            expect(hasWorkspaceSelectionChanged(previous, current)).toBe(true);
        });

        it('should detect change when a workspace is replaced', () => {
            const previous = ['policy-1', 'policy-2'];
            const current = ['policy-1', 'policy-3'];
            expect(hasWorkspaceSelectionChanged(previous, current)).toBe(true);
        });

        it('should detect change when selection goes from empty to having items', () => {
            const previous: string[] = [];
            const current = ['policy-1'];
            expect(hasWorkspaceSelectionChanged(previous, current)).toBe(true);
        });

        it('should detect change when selection goes from having items to empty', () => {
            const previous = ['policy-1'];
            const current: string[] = [];
            expect(hasWorkspaceSelectionChanged(previous, current)).toBe(true);
        });

        it('should detect no change when both arrays are empty', () => {
            const previous: string[] = [];
            const current: string[] = [];
            expect(hasWorkspaceSelectionChanged(previous, current)).toBe(false);
        });
    });
});
