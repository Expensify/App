import {render, renderHook} from '@testing-library/react-native';
import {createRef, forwardRef, useImperativeHandle} from 'react';
import type {Ref} from 'react';
import Onyx from 'react-native-onyx';
import {ProductTrainingContextProvider, useProductTrainingContext} from '@components/ProductTrainingContext';
import type {ProductTrainingTooltipName} from '@components/ProductTrainingContext/TOOLTIPS';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as TestHelper from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@hooks/useResponsiveLayout', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(),
}));

// Mock Fullstory library dependency
jest.mock('@libs/Fullstory', () => ({
    default: {
        consentAndIdentify: jest.fn(),
    },
    parseFSAttributes: jest.fn(),
}));

const DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE = {
    shouldUseNarrowLayout: true,
    isSmallScreenWidth: true,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isMediumScreenWidth: false,
    isLargeScreenWidth: false,
    isExtraSmallScreenWidth: false,
    isSmallScreen: false,
    onboardingIsMediumOrLargerScreenWidth: false,
    isExtraLargeScreenWidth: false,
};

const TEST_USER_ACCOUNT_ID = 1;
const TEST_USER_LOGIN = 'test@test.com';

const wrapper = ({children}: {children: React.ReactNode}) => <ProductTrainingContextProvider>{children}</ProductTrainingContextProvider>;

type ProductTrainingRef = ReturnType<typeof useProductTrainingContext>;

// A simple component that calls useProductTrainingContext and sets its result into the ref.
// Used in cases where using renderHook is not possible, for example, when we need to share the same instance of the context.
const ProductTraining = forwardRef(({tooltipName, shouldShow}: {tooltipName: ProductTrainingTooltipName; shouldShow?: boolean}, ref: Ref<ProductTrainingRef>) => {
    const result = useProductTrainingContext(tooltipName, shouldShow);

    useImperativeHandle(ref, () => result);

    return null;
});

const signUpWithTestUser = () => {
    TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
};

describe('ProductTrainingContextProvider', () => {
    beforeAll(() => {
        // Initialize Onyx
        Onyx.init({
            keys: ONYXKEYS,
        });
        return waitForBatchedUpdatesWithAct();
    });

    beforeEach(() => {
        // Set up test environment before each test
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
        Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        signUpWithTestUser();
    });

    afterEach(async () => {
        // Clean up test environment after each test
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    const mockUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;
    mockUseResponsiveLayout.mockReturnValue({...DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: false});

    describe('Basic Tooltip Registration', () => {
        it('should not register tooltips when app is loading', async () => {
            // When app is loading
            Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);
            await waitForBatchedUpdatesWithAct();

            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GLOBAL_CREATE_TOOLTIP;
            const {result} = renderHook(() => useProductTrainingContext(testTooltip), {wrapper});

            // Then tooltip should not show
            expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
        });

        it('should not register tooltips when onboarding is not completed', async () => {
            // When onboarding is not completed
            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await waitForBatchedUpdatesWithAct();

            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GLOBAL_CREATE_TOOLTIP;
            const {result} = renderHook(() => useProductTrainingContext(testTooltip), {wrapper});

            // Then tooltip should not show
            expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
        });

        it('should register tooltips when onboarding is completed and user is not migrated', async () => {
            // When onboarding is completed
            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await waitForBatchedUpdatesWithAct();

            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GLOBAL_CREATE_TOOLTIP;
            const {result} = renderHook(() => useProductTrainingContext(testTooltip), {wrapper});

            // Then tooltip should show
            expect(result.current.shouldShowProductTrainingTooltip).toBe(true);
        });

        it('should keep tooltip visible when another tooltip with shouldShow=false is unmounted', async () => {
            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GLOBAL_CREATE_TOOLTIP;
            const ref = createRef<ProductTrainingRef>();

            // When multiple tooltips with the same name but different shouldShow values are rendered
            const {rerender} = render(
                wrapper({
                    children: (
                        <>
                            <ProductTraining
                                ref={ref}
                                tooltipName={testTooltip}
                                shouldShow
                            />
                            <ProductTraining
                                tooltipName={testTooltip}
                                shouldShow={false}
                            />
                        </>
                    ),
                }),
            );
            await waitForBatchedUpdatesWithAct();

            // Then tooltip should be shown
            expect(ref.current?.shouldShowProductTrainingTooltip).toBe(true);

            // When tooltip with shouldShow=false is unmounted
            rerender(
                wrapper({
                    children: (
                        <ProductTraining
                            ref={ref}
                            tooltipName={testTooltip}
                            shouldShow
                        />
                    ),
                }),
            );
            await waitForBatchedUpdatesWithAct();

            // Then the remaining tooltip should still be shown
            expect(ref.current?.shouldShowProductTrainingTooltip).toBe(true);
        });
    });

    describe('Migrated User Scenarios', () => {
        it('should not show tooltips for migrated users before welcome modal dismissal', async () => {
            // When user is a migrated user and welcome modal is not dismissed
            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            Onyx.merge(ONYXKEYS.NVP_TRYNEWDOT, {nudgeMigration: {timestamp: new Date()}});
            await waitForBatchedUpdatesWithAct();

            // Then tooltips should not show
            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GLOBAL_CREATE_TOOLTIP;
            const {result} = renderHook(() => useProductTrainingContext(testTooltip), {wrapper});

            // Expect tooltip to be hidden
            expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
        });

        it('should show tooltips for migrated users after welcome modal dismissal', async () => {
            // When migrated user has dismissed welcome modal
            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            Onyx.merge(ONYXKEYS.NVP_TRYNEWDOT, {nudgeMigration: {timestamp: new Date()}});
            const date = new Date();
            Onyx.set(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                migratedUserWelcomeModal: DateUtils.getDBTime(date.valueOf()),
            });
            await waitForBatchedUpdatesWithAct();

            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GLOBAL_CREATE_TOOLTIP;
            const {result} = renderHook(() => useProductTrainingContext(testTooltip), {wrapper});

            // Then tooltip should show
            expect(result.current.shouldShowProductTrainingTooltip).toBe(true);
        });
    });

    describe('Tooltip Dismissal', () => {
        it('should not show dismissed tooltips', async () => {
            // When a tooltip has been dismissed
            const date = new Date();
            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GLOBAL_CREATE_TOOLTIP;
            Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                migratedUserWelcomeModal: DateUtils.getDBTime(date.valueOf()),
                [testTooltip]: DateUtils.getDBTime(date.valueOf()),
            });
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useProductTrainingContext(testTooltip), {wrapper});

            // Then tooltip should not show
            expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
        });
        it('should hide tooltip when hideProductTrainingTooltip is called', async () => {
            // When migrated user has dismissed welcome modal
            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            Onyx.merge(ONYXKEYS.NVP_TRYNEWDOT, {nudgeMigration: {timestamp: new Date()}});
            const date = new Date();
            Onyx.set(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                migratedUserWelcomeModal: DateUtils.getDBTime(date.valueOf()),
            });
            await waitForBatchedUpdatesWithAct();
            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GLOBAL_CREATE_TOOLTIP;
            const {result, rerender} = renderHook(() => useProductTrainingContext(testTooltip), {wrapper});
            // When the user dismiss the tooltip
            result.current.hideProductTrainingTooltip();
            rerender({});
            // Then tooltip should not show
            expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
            // And dismissed tooltip should be recorded in Onyx
            const dismissedTooltipsOnyxState = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING,
                    callback: (dismissedTooltips) => {
                        Onyx.disconnect(connection);
                        resolve(dismissedTooltips);
                    },
                });
            });
            // Expect dismissed tooltip to be recorded
            expect(dismissedTooltipsOnyxState).toHaveProperty(testTooltip);
        });
    });

    describe('Layout Specific Behavior', () => {
        it('should handle narrow layout specific tooltips based on screen width', async () => {
            // When narrow layout is false
            mockUseResponsiveLayout.mockReturnValue({...DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: false});

            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await waitForBatchedUpdatesWithAct();

            // TODO: To be replaced by expense reports search tooltip
            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.CONCEIRGE_LHN_GBR;
            const {result, rerender} = renderHook(() => useProductTrainingContext(testTooltip), {wrapper});
            // Then narrow layout tooltip should not show
            expect(result.current.shouldShowProductTrainingTooltip).toBe(false);

            // When narrow layout changes to true
            mockUseResponsiveLayout.mockReturnValue({...DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
            rerender({});
            await waitForBatchedUpdatesWithAct();

            // Then narrow layout tooltip should show
            expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
        });
        it('should handle wide layout specific tooltips based on screen width', async () => {
            // When narrow layout is true
            mockUseResponsiveLayout.mockReturnValue({...DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});

            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await waitForBatchedUpdatesWithAct();

            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.RENAME_SAVED_SEARCH;
            const {result, rerender} = renderHook(() => useProductTrainingContext(testTooltip), {wrapper});
            // Then wide layout tooltip should not show
            expect(result.current.shouldShowProductTrainingTooltip).toBe(false);

            // When narrow layout changes to false
            mockUseResponsiveLayout.mockReturnValue({...DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: false});
            rerender({});
            await waitForBatchedUpdatesWithAct();

            // Then wide layout tooltip should show
            expect(result.current.shouldShowProductTrainingTooltip).toBe(true);
        });
    });

    describe('Priority Handling', () => {
        it('should show only highest priority tooltip when multiple are active', async () => {
            // When multiple tooltips are registered and no tooltips are dismissed
            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            const date = new Date();
            Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                migratedUserWelcomeModal: DateUtils.getDBTime(date.valueOf()),
            });
            await waitForBatchedUpdatesWithAct();

            // Then only highest priority tooltip should show
            const highPriorityTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GLOBAL_CREATE_TOOLTIP;
            const lowPriorityTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.LHN_WORKSPACE_CHAT_TOOLTIP;

            const {result} = renderHook(
                () => ({
                    higher: useProductTrainingContext(highPriorityTooltip),
                    lower: useProductTrainingContext(lowPriorityTooltip),
                }),
                {wrapper},
            );

            // Expect only higher priority tooltip to be visible
            expect(result.current.higher.shouldShowProductTrainingTooltip).toBe(true);
            expect(result.current.lower.shouldShowProductTrainingTooltip).toBe(false);
        });

        it('should show lower priority tooltip when higher priority is dismissed', async () => {
            // When higher priority tooltip is dismissed
            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            const date = new Date();
            const highPriorityTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GLOBAL_CREATE_TOOLTIP;
            const lowPriorityTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.LHN_WORKSPACE_CHAT_TOOLTIP;

            Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                migratedUserWelcomeModal: DateUtils.getDBTime(date.valueOf()),
                [highPriorityTooltip]: DateUtils.getDBTime(date.valueOf()),
            });
            await waitForBatchedUpdatesWithAct();

            // Then lower priority tooltip should show
            const {result} = renderHook(
                () => ({
                    higher: useProductTrainingContext(highPriorityTooltip),
                    lower: useProductTrainingContext(lowPriorityTooltip),
                }),
                {wrapper},
            );

            // Expect higher priority tooltip to be hidden and lower priority to be visible
            expect(result.current.higher.shouldShowProductTrainingTooltip).toBe(false);
            expect(result.current.lower.shouldShowProductTrainingTooltip).toBe(true);
        });

        it('should transition to next priority tooltip when current is dismissed', async () => {
            // When starting with all tooltips visible
            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            const date = new Date();
            Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                migratedUserWelcomeModal: DateUtils.getDBTime(date.valueOf()),
            });
            await waitForBatchedUpdatesWithAct();

            const highPriorityTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GLOBAL_CREATE_TOOLTIP;
            const lowPriorityTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.LHN_WORKSPACE_CHAT_TOOLTIP;

            const {result} = renderHook(
                () => ({
                    higher: useProductTrainingContext(highPriorityTooltip),
                    lower: useProductTrainingContext(lowPriorityTooltip),
                }),
                {wrapper},
            );

            // Then initially higher priority should be visible
            expect(result.current.higher.shouldShowProductTrainingTooltip).toBe(true);
            expect(result.current.lower.shouldShowProductTrainingTooltip).toBe(false);

            // When dismissing higher priority tooltip
            Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                [highPriorityTooltip]: DateUtils.getDBTime(date.valueOf()),
            });
            await waitForBatchedUpdatesWithAct();

            // Then lower priority tooltip should become visible
            expect(result.current.lower.shouldShowProductTrainingTooltip).toBe(true);
        });
    });
});
