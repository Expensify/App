import {fireEvent, render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import GettingStartedSection from '@src/pages/home/GettingStartedSection';
import ROUTES from '@src/ROUTES';
import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

const TEST_POLICY_ID = 'ABC123';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string, params?: Record<string, string>) => {
            if (params && 'integrationName' in params) {
                return `${key}:${params.integrationName}`;
            }
            return key;
        }),
    })),
);

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));

const renderGettingStartedSection = () =>
    render(
        <OnyxListItemProvider>
            <GettingStartedSection />
        </OnyxListItemProvider>,
    );

/**
 * Sets up Onyx state for a manage-team user with an active trial
 * so the section is visible by default.
 */
async function setManageTeamUserState(overrides?: {
    integration?: string | null;
    areCompanyCardsEnabled?: boolean;
    areRulesEnabled?: boolean;
    areAccountingEnabled?: boolean;
    areCategoriesEnabled?: boolean;
    hasAccountingConnection?: boolean;
    hasCustomCategories?: boolean;
    hasCompanyCardConnection?: boolean;
    hasConfiguredRules?: boolean;
    trialStartDate?: string;
}) {
    const trialStart = overrides?.trialStartDate ?? '2026-03-01';

    await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {
        choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
    });
    await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, TEST_POLICY_ID);
    await Onyx.set(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, trialStart);
    await Onyx.set(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION, (overrides?.integration ?? 'quickbooksOnline') as never);

    const policyData: Record<string, unknown> = {
        id: TEST_POLICY_ID,
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.TEAM,
        role: CONST.POLICY.ROLE.ADMIN,
        areCompanyCardsEnabled: overrides?.areCompanyCardsEnabled ?? true,
        areRulesEnabled: overrides?.areRulesEnabled ?? true,
        areConnectionsEnabled: overrides?.areAccountingEnabled,
        areCategoriesEnabled: overrides?.areCategoriesEnabled,
    };

    if (overrides?.hasAccountingConnection) {
        policyData.connections = {
            quickbooksOnline: {
                config: {},
                data: {},
            },
        };
    }

    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${TEST_POLICY_ID}` as never, policyData as never);
    await waitForBatchedUpdates();
}

describe('GettingStartedSection', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('visibility', () => {
        it('does not render when intent is not manage-team', async () => {
            await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {
                choice: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND,
            });
            await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, TEST_POLICY_ID);
            await Onyx.set(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, '2026-03-01');
            await waitForBatchedUpdates();

            renderGettingStartedSection();

            expect(screen.queryByText('homePage.gettingStartedSection.title')).toBeNull();
        });

        it('does not render when 60-day cutoff has passed', async () => {
            await setManageTeamUserState({
                trialStartDate: '2026-01-01',
            });

            renderGettingStartedSection();

            expect(screen.queryByText('homePage.gettingStartedSection.title')).toBeNull();
        });

        it('does not render when user is not an admin (role is user)', async () => {
            await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {
                choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
            });
            await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, TEST_POLICY_ID);
            await Onyx.set(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, '2026-03-01');
            await Onyx.set(
                `${ONYXKEYS.COLLECTION.POLICY}${TEST_POLICY_ID}` as never,
                {
                    id: TEST_POLICY_ID,
                    name: 'Test Workspace',
                    type: CONST.POLICY.TYPE.TEAM,
                    role: CONST.POLICY.ROLE.USER,
                    areCompanyCardsEnabled: true,
                    areRulesEnabled: true,
                } as never,
            );
            await waitForBatchedUpdates();

            renderGettingStartedSection();

            expect(screen.queryByText('homePage.gettingStartedSection.title')).toBeNull();
        });

        it('does not render when user is not an admin (role is auditor)', async () => {
            await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {
                choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
            });
            await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, TEST_POLICY_ID);
            await Onyx.set(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, '2026-03-01');
            await Onyx.set(
                `${ONYXKEYS.COLLECTION.POLICY}${TEST_POLICY_ID}` as never,
                {
                    id: TEST_POLICY_ID,
                    name: 'Test Workspace',
                    type: CONST.POLICY.TYPE.TEAM,
                    role: CONST.POLICY.ROLE.AUDITOR,
                    areCompanyCardsEnabled: true,
                    areRulesEnabled: true,
                } as never,
            );
            await waitForBatchedUpdates();

            renderGettingStartedSection();

            expect(screen.queryByText('homePage.gettingStartedSection.title')).toBeNull();
        });

        it('renders when user is an admin', async () => {
            await setManageTeamUserState();

            renderGettingStartedSection();

            expect(screen.getByText('homePage.gettingStartedSection.title')).toBeTruthy();
        });

        it('renders when manage-team intent is set via fallback ONBOARDING_PURPOSE_SELECTED', async () => {
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.MANAGE_TEAM as never);
            await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, TEST_POLICY_ID);
            await Onyx.set(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, '2026-03-01');
            await Onyx.set(
                `${ONYXKEYS.COLLECTION.POLICY}${TEST_POLICY_ID}` as never,
                {
                    id: TEST_POLICY_ID,
                    name: 'Test Workspace',
                    type: CONST.POLICY.TYPE.TEAM,
                    role: CONST.POLICY.ROLE.ADMIN,
                    areCompanyCardsEnabled: true,
                    areRulesEnabled: true,
                } as never,
            );
            await waitForBatchedUpdates();

            renderGettingStartedSection();

            expect(screen.getByText('homePage.gettingStartedSection.title')).toBeTruthy();
        });
    });

    describe('section title', () => {
        it('renders the "Getting started" section title', async () => {
            await setManageTeamUserState();

            renderGettingStartedSection();

            expect(screen.getByText('homePage.gettingStartedSection.title')).toBeTruthy();
        });
    });

    describe('row rendering', () => {
        it('always shows "Create a workspace" row', async () => {
            await setManageTeamUserState();

            renderGettingStartedSection();

            expect(screen.getByText('homePage.gettingStartedSection.createWorkspace')).toBeTruthy();
        });

        it('shows "Connect to [system]" row for QBO integration', async () => {
            await setManageTeamUserState({integration: 'quickbooksOnline', areAccountingEnabled: true});

            renderGettingStartedSection();

            expect(screen.getByText(/homePage\.gettingStartedSection\.connectAccounting/)).toBeTruthy();
        });

        it('shows "Connect to [system]" row for Xero integration', async () => {
            await setManageTeamUserState({integration: 'xero', areAccountingEnabled: true});

            renderGettingStartedSection();

            expect(screen.getByText(/homePage\.gettingStartedSection\.connectAccounting/)).toBeTruthy();
        });

        it('shows "Customize accounting categories" for non-direct-connect integrations', async () => {
            await setManageTeamUserState({integration: 'other', areCategoriesEnabled: true});

            renderGettingStartedSection();

            expect(screen.getByText('homePage.gettingStartedSection.customizeCategories')).toBeTruthy();
            expect(screen.queryByText(/homePage\.gettingStartedSection\.connectAccounting/)).toBeNull();
        });

        it('shows "Customize accounting categories" when no integration is selected', async () => {
            await setManageTeamUserState({integration: 'none', areCategoriesEnabled: true});

            renderGettingStartedSection();

            expect(screen.getByText('homePage.gettingStartedSection.customizeCategories')).toBeTruthy();
        });

        it('shows "Link company cards" row when company cards feature is enabled', async () => {
            await setManageTeamUserState({areCompanyCardsEnabled: true});

            renderGettingStartedSection();

            expect(screen.getByText('homePage.gettingStartedSection.linkCompanyCards')).toBeTruthy();
        });

        it('always shows "Link company cards" row even when company cards feature is disabled', async () => {
            await setManageTeamUserState({areCompanyCardsEnabled: false});

            renderGettingStartedSection();

            expect(screen.getByText('homePage.gettingStartedSection.linkCompanyCards')).toBeTruthy();
        });

        it('shows "Set up spend rules" row when rules feature is enabled', async () => {
            await setManageTeamUserState({areRulesEnabled: true});

            renderGettingStartedSection();

            expect(screen.getByText('homePage.gettingStartedSection.setupRules')).toBeTruthy();
        });

        it('does not show "Set up spend rules" row when rules feature is disabled', async () => {
            await setManageTeamUserState({areRulesEnabled: false});

            renderGettingStartedSection();

            expect(screen.queryByText('homePage.gettingStartedSection.setupRules')).toBeNull();
        });

        it('renders rows in the expected order: workspace, accounting, cards, rules', async () => {
            await setManageTeamUserState({
                integration: 'quickbooksOnline',
                areAccountingEnabled: true,
                areCompanyCardsEnabled: true,
                areRulesEnabled: true,
            });

            renderGettingStartedSection();

            const allRows = screen.getAllByText(/homePage\.gettingStartedSection\./);
            const rowTexts = allRows.map((el) => (el.props as {children: string}).children);
            const createIdx = rowTexts.findIndex((t) => t.includes('createWorkspace'));
            const accountingIdx = rowTexts.findIndex((t) => t.includes('connectAccounting'));
            const cardsIdx = rowTexts.findIndex((t) => t.includes('linkCompanyCards'));
            const rulesIdx = rowTexts.findIndex((t) => t.includes('setupRules'));

            expect(createIdx).toBeLessThan(accountingIdx);
            expect(accountingIdx).toBeLessThan(cardsIdx);
            expect(cardsIdx).toBeLessThan(rulesIdx);
        });
    });

    describe('checked state', () => {
        it('"Create a workspace" row is always checked', async () => {
            await setManageTeamUserState();

            renderGettingStartedSection();

            const createRow = screen.getByText('homePage.gettingStartedSection.createWorkspace');
            const parentRow = createRow.parent;
            expect(parentRow).toBeTruthy();
        });

        it('accounting row is checked when workspace has a successful connection', async () => {
            await setManageTeamUserState({
                integration: 'quickbooksOnline',
                areAccountingEnabled: true,
                hasAccountingConnection: true,
            });

            renderGettingStartedSection();

            expect(screen.getByText(/homePage\.gettingStartedSection\.connectAccounting/)).toBeTruthy();
        });
    });

    describe('navigation', () => {
        it('navigates to workspace overview when "Create a workspace" row is pressed', async () => {
            await setManageTeamUserState();

            renderGettingStartedSection();

            const row = screen.getByText('homePage.gettingStartedSection.createWorkspace');
            fireEvent.press(row);

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_OVERVIEW.getRoute(TEST_POLICY_ID));
        });

        it('navigates to workspace accounting when "Connect to [system]" row is pressed', async () => {
            await setManageTeamUserState({integration: 'quickbooksOnline', areAccountingEnabled: true});

            renderGettingStartedSection();

            const row = screen.getByText(/homePage\.gettingStartedSection\.connectAccounting/);
            fireEvent.press(row);

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_ACCOUNTING.getRoute(TEST_POLICY_ID));
        });

        it('navigates to workspace categories when "Customize categories" row is pressed', async () => {
            await setManageTeamUserState({integration: 'other', areCategoriesEnabled: true});

            renderGettingStartedSection();

            const row = screen.getByText('homePage.gettingStartedSection.customizeCategories');
            fireEvent.press(row);

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_CATEGORIES.getRoute(TEST_POLICY_ID));
        });

        it('navigates to workspace company cards when "Link company cards" row is pressed', async () => {
            await setManageTeamUserState({areCompanyCardsEnabled: true});

            renderGettingStartedSection();

            const row = screen.getByText('homePage.gettingStartedSection.linkCompanyCards');
            fireEvent.press(row);

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(TEST_POLICY_ID));
        });

        it('navigates to workspace rules when "Set up spend rules" row is pressed', async () => {
            await setManageTeamUserState({areRulesEnabled: true});

            renderGettingStartedSection();

            const row = screen.getByText('homePage.gettingStartedSection.setupRules');
            fireEvent.press(row);

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_RULES.getRoute(TEST_POLICY_ID));
        });
    });
});
