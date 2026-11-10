import {render, renderHook} from '@testing-library/react-native';

import {ProductTrainingContextProvider, useProductTrainingContext} from '@components/ProductTrainingContext';
import type {ProductTrainingTooltipName} from '@components/ProductTrainingContext/TOOLTIPS';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {setModalVisibility, willAlertModalBecomeVisible} from '@libs/actions/Modal';
import DateUtils from '@libs/DateUtils';
import {setHasRadio} from '@libs/NetworkState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {Ref, RefObject} from 'react';

import {createRef, useImperativeHandle} from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(),
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
    isInLandscapeMode: false,
};

const TEST_USER_ACCOUNT_ID = 1;
const TEST_USER_LOGIN = 'test@test.com';

const wrapper = ({children}: {children: React.ReactNode}) => <ProductTrainingContextProvider>{children}</ProductTrainingContextProvider>;

type ProductTrainingRef = ReturnType<typeof useProductTrainingContext>;

// A simple component that calls useProductTrainingContext and sets its result into the ref.
// Used in cases where using renderHook is not possible, for example, when we need to share the same instance of the context.
function ProductTraining({tooltipName, shouldShow, ref, onRender}: {tooltipName: ProductTrainingTooltipName; shouldShow?: boolean; ref?: Ref<ProductTrainingRef>; onRender?: jest.Mock}) {
    const result = useProductTrainingContext(tooltipName, shouldShow);
    onRender?.(result.shouldShowProductTrainingTooltip);

    useImperativeHandle(ref, () => result);

    return null;
}

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
        setHasRadio(true);
        Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        signUpWithTestUser();
    });

    afterEach(async () => {
        // Clean up test environment after each test
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);
    mockUseResponsiveLayout.mockReturnValue({...DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: false});

    describe('Basic Tooltip Registration', () => {
        it('should not register tooltips when app is loading', async () => {
            // When app is loading
            Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);
            await waitForBatchedUpdatesWithAct();

            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GPS_TOOLTIP;
            const {result} = renderHook(() => useProductTrainingContext(testTooltip), {wrapper});

            // Then tooltip should not show
            expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
        });

        it('should not register tooltips when onboarding is not completed', async () => {
            // When onboarding is not completed
            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await waitForBatchedUpdatesWithAct();

            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GPS_TOOLTIP;
            const {result} = renderHook(() => useProductTrainingContext(testTooltip), {wrapper});

            // Then tooltip should not show
            expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
        });

        it('should register tooltips when onboarding is completed and user is not migrated', async () => {
            // When onboarding is completed
            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await waitForBatchedUpdatesWithAct();

            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GPS_TOOLTIP;
            const {result} = renderHook(() => useProductTrainingContext(testTooltip), {wrapper});

            // Then tooltip should show
            expect(result.current.shouldShowProductTrainingTooltip).toBe(true);
        });

        it('should keep tooltip visible when another tooltip with shouldShow=false is unmounted', async () => {
            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GPS_TOOLTIP;
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

    describe('Tooltip Dismissal', () => {
        it('should not show dismissed tooltips', async () => {
            // When a tooltip has been dismissed
            const date = new Date();
            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GPS_TOOLTIP;
            Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                migratedUserWelcomeModal: {
                    timestamp: DateUtils.getDBTime(date.valueOf()),
                },
                [testTooltip]: {
                    timestamp: DateUtils.getDBTime(date.valueOf()),
                },
            });
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useProductTrainingContext(testTooltip), {wrapper});

            // Then tooltip should not show
            expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
        });
        it('should hide tooltip when hideProductTrainingTooltip is called', async () => {
            // When migrated user has dismissed welcome modal
            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            const date = new Date();
            Onyx.set(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                migratedUserWelcomeModal: {
                    timestamp: DateUtils.getDBTime(date.valueOf()),
                },
            });
            await waitForBatchedUpdatesWithAct();
            const testTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GPS_TOOLTIP;
            const {result, rerender} = renderHook(() => useProductTrainingContext(testTooltip), {wrapper});
            // When the user dismiss the tooltip
            result.current.hideProductTrainingTooltip();
            await waitForBatchedUpdatesWithAct();
            rerender({});
            // Then tooltip should not show
            expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
            // And dismissed tooltip should be recorded in Onyx
            const dismissedTooltipsOnyxState = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING,
                    callback: (dismissedTooltips) => {
                        connection.unsubscribe();
                        resolve(dismissedTooltips);
                    },
                });
            });
            // Expect dismissed tooltip to be recorded
            expect(dismissedTooltipsOnyxState).toHaveProperty(testTooltip);
        });
    });

    describe('Priority Handling', () => {
        it('should show only highest priority tooltip when multiple are active', async () => {
            // When multiple tooltips are registered and no tooltips are dismissed
            Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            const date = new Date();
            Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                migratedUserWelcomeModal: {
                    timestamp: DateUtils.getDBTime(date.valueOf()),
                },
            });
            await waitForBatchedUpdatesWithAct();

            // Then only highest priority tooltip should show
            const highPriorityTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.ACCOUNT_SWITCHER;
            const lowPriorityTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GPS_TOOLTIP;

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
            const highPriorityTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.ACCOUNT_SWITCHER;
            const lowPriorityTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GPS_TOOLTIP;

            Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                migratedUserWelcomeModal: {
                    timestamp: DateUtils.getDBTime(date.valueOf()),
                },
                [highPriorityTooltip]: {
                    timestamp: DateUtils.getDBTime(date.valueOf()),
                },
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
                migratedUserWelcomeModal: {
                    timestamp: DateUtils.getDBTime(date.valueOf()),
                },
            });
            await waitForBatchedUpdatesWithAct();

            const highPriorityTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.ACCOUNT_SWITCHER;
            const lowPriorityTooltip = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GPS_TOOLTIP;

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
                [highPriorityTooltip]: {
                    timestamp: DateUtils.getDBTime(date.valueOf()),
                },
            });
            await waitForBatchedUpdatesWithAct();

            // Then lower priority tooltip should become visible
            expect(result.current.lower.shouldShowProductTrainingTooltip).toBe(true);
        });
    });

    describe('Consumer renders', () => {
        const {ACCOUNT_SWITCHER, GPS_TOOLTIP, MILEAGE_RATE_AUTO_UPDATED, SCAN_TEST_DRIVE_CONFIRMATION} = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES;

        it('does not render consumers when a right-docked screen opens and closes while no tooltip is visible', async () => {
            // Given a consumer whose tooltip was dismissed, like most tooltips mounted under the Search Router for a returning user
            Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {[ACCOUNT_SWITCHER]: {timestamp: DateUtils.getDBTime()}});
            const onRender = jest.fn();
            render(
                wrapper({
                    children: (
                        <ProductTraining
                            tooltipName={ACCOUNT_SWITCHER}
                            onRender={onRender}
                        />
                    ),
                }),
            );
            await waitForBatchedUpdatesWithAct();
            onRender.mockClear();

            // When a right-docked screen such as the Search Router is focused and then blurred, which writes the modal visibility on every open and close
            setModalVisibility(true, CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED);
            await waitForBatchedUpdatesWithAct();
            setModalVisibility(false);
            willAlertModalBecomeVisible(false);
            await waitForBatchedUpdatesWithAct();

            // Then the consumer does not render, because the tooltip allowed to show did not change
            expect(onRender).not.toHaveBeenCalled();
        });

        it('does not render the visible tooltip when another consumer stops asking to show its tooltip', async () => {
            // Given a visible tooltip and a consumer with a dismissed tooltip next to it, like the account button next to the LHN rows
            Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {[GPS_TOOLTIP]: {timestamp: DateUtils.getDBTime()}});
            const ref = createRef<ProductTrainingRef>();
            const onRender = jest.fn();
            const visibleConsumer = (
                <ProductTraining
                    ref={ref}
                    tooltipName={ACCOUNT_SWITCHER}
                    onRender={onRender}
                />
            );
            const renderWithOtherConsumer = (shouldShow: boolean) =>
                wrapper({
                    children: (
                        <>
                            {visibleConsumer}
                            <ProductTraining
                                tooltipName={GPS_TOOLTIP}
                                shouldShow={shouldShow}
                            />
                        </>
                    ),
                });
            const {rerender} = render(renderWithOtherConsumer(true));
            await waitForBatchedUpdatesWithAct();
            onRender.mockClear();

            // When the other consumer stops asking, as the LHN rows do when their screen loses focus
            rerender(renderWithOtherConsumer(false));
            await waitForBatchedUpdatesWithAct();

            // Then the visible tooltip's consumer does not render and its tooltip stays visible
            expect(onRender).not.toHaveBeenCalled();
            expect(ref.current?.shouldShowProductTrainingTooltip).toBe(true);
        });

        it('hands the slot to a tooltip shown inside a modal in the same render the modal hides a higher-priority one', async () => {
            // Given a higher-priority tooltip that hides under modals and a lower-priority one that is shown inside a modal
            const onAccountSwitcherRender = jest.fn();
            const onScanRender = jest.fn();
            render(
                wrapper({
                    children: (
                        <>
                            <ProductTraining
                                tooltipName={ACCOUNT_SWITCHER}
                                onRender={onAccountSwitcherRender}
                            />
                            <ProductTraining
                                tooltipName={SCAN_TEST_DRIVE_CONFIRMATION}
                                onRender={onScanRender}
                            />
                        </>
                    ),
                }),
            );
            await waitForBatchedUpdatesWithAct();
            expect(onAccountSwitcherRender).toHaveBeenLastCalledWith(true);
            onAccountSwitcherRender.mockClear();
            onScanRender.mockClear();

            // When a modal opens
            setModalVisibility(true);
            await waitForBatchedUpdatesWithAct();

            // Then each consumer renders once and the in-modal tooltip shows right away, so there is no frame where neither tooltip shows
            expect(onAccountSwitcherRender.mock.calls).toEqual([[false]]);
            expect(onScanRender.mock.calls).toEqual([[true]]);

            // When the modal closes
            setModalVisibility(false);
            await waitForBatchedUpdatesWithAct();

            // Then the higher-priority tooltip shows again
            expect(onAccountSwitcherRender).toHaveBeenLastCalledWith(true);
            expect(onScanRender).toHaveBeenLastCalledWith(false);
        });

        it('keeps a tooltip visible while another consumer sharing its name unmounts', async () => {
            // Given two consumers of the same tooltip, like the rows of a list that each ask for one tooltip name
            const ref = createRef<ProductTrainingRef>();
            const renderConsumers = (shouldMountSecond: boolean) =>
                wrapper({
                    children: (
                        <>
                            <ProductTraining
                                ref={ref}
                                tooltipName={ACCOUNT_SWITCHER}
                            />
                            {shouldMountSecond && <ProductTraining tooltipName={ACCOUNT_SWITCHER} />}
                        </>
                    ),
                });
            const {rerender} = render(renderConsumers(true));
            await waitForBatchedUpdatesWithAct();

            // When one of them unmounts, as a virtualized row does when it scrolls out of view
            rerender(renderConsumers(false));
            await waitForBatchedUpdatesWithAct();

            // Then the tooltip stays visible for the consumer that is still mounted
            expect(ref.current?.shouldShowProductTrainingTooltip).toBe(true);
        });

        it('hides tooltips under an alert modal and the mileage rate tooltip only under a popover', async () => {
            // Given a tooltip that hides under modals and the mileage rate tooltip that is shown on a modal screen
            const accountSwitcherRef = createRef<ProductTrainingRef>();
            const mileageRef = createRef<ProductTrainingRef>();
            const renderConsumer = (tooltipName: typeof ACCOUNT_SWITCHER | typeof MILEAGE_RATE_AUTO_UPDATED, ref: RefObject<ProductTrainingRef | null>) =>
                render(
                    wrapper({
                        children: (
                            <ProductTraining
                                ref={ref}
                                tooltipName={tooltipName}
                            />
                        ),
                    }),
                );
            renderConsumer(ACCOUNT_SWITCHER, accountSwitcherRef);
            renderConsumer(MILEAGE_RATE_AUTO_UPDATED, mileageRef);
            await waitForBatchedUpdatesWithAct();

            // When an alert modal is about to become visible
            willAlertModalBecomeVisible(true);
            await waitForBatchedUpdatesWithAct();

            // Then the regular tooltip hides and the mileage rate tooltip stays, because only popovers cover the mileage rate field
            expect(accountSwitcherRef.current?.shouldShowProductTrainingTooltip).toBe(false);
            expect(mileageRef.current?.shouldShowProductTrainingTooltip).toBe(true);

            // When a popover such as the inline date picker is about to become visible
            willAlertModalBecomeVisible(true, true);
            await waitForBatchedUpdatesWithAct();

            // Then the mileage rate tooltip hides too
            expect(mileageRef.current?.shouldShowProductTrainingTooltip).toBe(false);
        });
    });
});
