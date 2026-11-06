/** Mounts the existing confirmation content to check route discrimination and its first-only receipt callback. */
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import type DragAndDropConsumerProps from '@components/DragAndDrop/Consumer/types';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';

import useFilesValidation from '@hooks/useFilesValidation';

import type * as ReceiptModule from '@libs/actions/IOU/Receipt';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type navigationRef from '@libs/Navigation/navigationRef';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import IOURequestStepConfirmation, {IOURequestStepConfirmationContentWithWritableReportOrNotFound} from '@pages/iou/request/step/IOURequestStepConfirmation';

import {setMoneyRequestReceipt} from '@userActions/IOU/Receipt';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import type * as ReactNavigationNative from '@react-navigation/native';

import {useRoute} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import createMockScreenNavigation from '../../utils/createMockScreenNavigation';
import {setupGlobalFetchMock, signInWithTestUser} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useFilesValidation', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout');
jest.mock('@libs/getIsNarrowLayout', () => jest.fn(() => false));
jest.mock('@components/ProductTrainingContext', () => ({useProductTrainingContext: () => [false]}));
jest.mock('@libs/actions/IOU/Receipt', () => ({...jest.requireActual<typeof ReceiptModule>('@libs/actions/IOU/Receipt'), setMoneyRequestReceipt: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => {
    const {default: mockCreateMock} = jest.requireActual<{default: typeof createMock}>('../../utils/createMock');
    const {default: mockNavigationRef} = jest.requireActual<{default: typeof navigationRef}>('@libs/Navigation/navigationRef');
    // Only navigation dependencies are substituted. Both public wrappers and NotFound remain real.
    const mockNavigation = mockCreateMock<typeof Navigation>({
        getActiveRoute: jest.fn<ReturnType<typeof Navigation.getActiveRoute>, Parameters<typeof Navigation.getActiveRoute>>(() => ''),
        isNavigationReady: jest.fn<ReturnType<typeof Navigation.isNavigationReady>, Parameters<typeof Navigation.isNavigationReady>>(() => Promise.resolve()),
        navigate: jest.fn<ReturnType<typeof Navigation.navigate>, Parameters<typeof Navigation.navigate>>(),
        goBack: jest.fn<ReturnType<typeof Navigation.goBack>, Parameters<typeof Navigation.goBack>>(),
        dismissModal: jest.fn<ReturnType<typeof Navigation.dismissModal>, Parameters<typeof Navigation.dismissModal>>(),
        getActiveRouteWithoutParams: jest.fn<ReturnType<typeof Navigation.getActiveRouteWithoutParams>, Parameters<typeof Navigation.getActiveRouteWithoutParams>>(() => ''),
        getTopmostReportId: jest.fn<ReturnType<typeof Navigation.getTopmostReportId>, Parameters<typeof Navigation.getTopmostReportId>>(() => undefined),
        getIsFullscreenPreInsertedUnderRHP: jest.fn<ReturnType<typeof Navigation.getIsFullscreenPreInsertedUnderRHP>, Parameters<typeof Navigation.getIsFullscreenPreInsertedUnderRHP>>(
            () => false,
        ),
        preInsertFullscreenUnderRHP: jest.fn<ReturnType<typeof Navigation.preInsertFullscreenUnderRHP>, Parameters<typeof Navigation.preInsertFullscreenUnderRHP>>(),
        removePreInsertedFullscreenIfNeeded: jest.fn<ReturnType<typeof Navigation.removePreInsertedFullscreenIfNeeded>, Parameters<typeof Navigation.removePreInsertedFullscreenIfNeeded>>(),
        isTopmostRouteModalScreen: jest.fn<ReturnType<typeof Navigation.isTopmostRouteModalScreen>, Parameters<typeof Navigation.isTopmostRouteModalScreen>>(() => false),
    });
    return {__esModule: true, default: mockNavigation, navigationRef: mockNavigationRef};
});
jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
    const {default: mockScreenNavigation} = jest.requireActual<{default: typeof createMockScreenNavigation}>('../../utils/createMockScreenNavigation');
    const {navigation} = mockScreenNavigation();
    return {...actual, useIsFocused: () => true, useFocusEffect: jest.fn(), usePreventRemove: jest.fn(), useNavigation: () => navigation, useRoute: jest.fn()};
});

const {navigation} = createMockScreenNavigation();
const transaction: Transaction = {
    transactionID: 'boundary-tx',
    reportID: '100',
    amount: 1000,
    created: '2026-01-15',
    currency: 'USD',
    merchant: 'Cafe',
    iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
    isFromGlobalCreate: true,
    participants: [{accountID: 2, selected: true}],
    comment: {comment: 'Lunch'},
};

// Both public exports use the same incoming route union. ComponentProps is the native test exception.

function ConfirmationBoundary({
    route,
    standalone = false,
}: Pick<React.ComponentProps<typeof IOURequestStepConfirmationContentWithWritableReportOrNotFound>, 'route'> & {standalone?: boolean}) {
    const Confirmation = standalone ? IOURequestStepConfirmation : IOURequestStepConfirmationContentWithWritableReportOrNotFound;
    return (
        <OnyxListItemProvider>
            <HTMLEngineProvider>
                <CurrentUserPersonalDetailsProvider>
                    <LocaleContextProvider>
                        <ScreenWrapper testID="confirmation-boundary">
                            <Confirmation
                                route={route}
                                navigation={navigation}
                            />
                        </ScreenWrapper>
                    </LocaleContextProvider>
                </CurrentUserPersonalDetailsProvider>
            </HTMLEngineProvider>
        </OnyxListItemProvider>
    );
}

type ValidationCallback = Parameters<typeof useFilesValidation>[0];
type ValidationResult = ReturnType<typeof useFilesValidation>;
const validators = new Map<ValidationCallback, ValidationResult['validateFiles']>();
let selectedReceiptCallback: ValidationCallback | undefined;

type ConfirmationDropConsumerProps = {
    children: React.ReactElement;
    onDrop: NonNullable<DragAndDropConsumerProps['onDrop']>;
};

// The renderer exposes untyped props; narrow the actual component's child and callback contract.
function isConfirmationDropConsumerProps(value: unknown): value is ConfirmationDropConsumerProps {
    return typeof value === 'object' && value !== null && 'children' in value && React.isValidElement(value.children) && 'onDrop' in value && typeof value.onDrop === 'function';
}

// Attribute the callback through the real confirmation drop consumer and its validator.
// Compiler-generated function names and unrelated receipt-picker registrations are irrelevant.
function getConfirmationReceiptCallback(): ValidationCallback {
    if (selectedReceiptCallback) {
        return selectedReceiptCallback;
    }
    const consumers = screen.UNSAFE_getAllByType(DragAndDropConsumer);
    expect(consumers).toHaveLength(1);
    const consumer = consumers.at(0);
    if (!consumer) {
        throw new Error('Expected the actual confirmation drop consumer');
    }
    const consumerProps: unknown = consumer.props;
    if (!isConfirmationDropConsumerProps(consumerProps)) {
        throw new Error('Expected the actual confirmation drop-zone child and handler');
    }
    expect(consumerProps.children.type).toBe(DropZoneUI);
    const {onDrop} = consumerProps;
    const probe = new File(['receipt attribution'], 'receipt-attribution.text', {type: 'text/plain'});
    const item = createMock<DataTransferItem>({kind: 'file', type: 'text/plain'});
    const items = [item];
    const event = createMock<DragEvent>({
        dataTransfer: {
            files: Object.assign(createMock<FileList>({length: 1}), [probe]),
            items: Object.assign(createMock<DataTransferItemList>({length: 1}), items),
        },
    });
    // Exercise only the consumer-to-validator boundary. Do not deliver the probe to the receipt callback.
    const url = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:attribution');
    try {
        act(() => {
            onDrop(event);
        });
        expect(url.mock.calls).toEqual([[probe]]);
        expect(setMoneyRequestReceipt).not.toHaveBeenCalled();
    } finally {
        url.mockRestore();
    }
    // Other mounted receipt pickers register validators, but the confirmation consumer must select exactly one.
    const called = [...validators.entries()].filter(([, validate]) => jest.mocked(validate).mock.calls.length > 0);
    expect(called).toHaveLength(1);
    const selected = called.at(0);
    if (!selected) {
        throw new Error('Actual confirmation consumer must select one validator');
    }
    const [callback, validate] = selected;
    expect(jest.mocked(validate).mock.calls).toEqual([[[probe], items]]);
    expect(jest.mocked(validate).mock.calls.at(0)?.[0].at(0)).toBe(probe);
    expect(jest.mocked(validate).mock.calls.at(0)?.[1]?.at(0)).toBe(item);
    selectedReceiptCallback = callback;
    return callback;
}

describe('real wrapped confirmation boundaries', () => {
    setupGlobalFetchMock();
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });
    beforeEach(async () => {
        jest.clearAllMocks();
        validators.clear();
        selectedReceiptCallback = undefined;
        jest.mocked(useFilesValidation).mockImplementation((callback) => {
            let validateFiles = validators.get(callback);
            if (!validateFiles) {
                validateFiles = jest.fn<ReturnType<ValidationResult['validateFiles']>, Parameters<ValidationResult['validateFiles']>>();
                validators.set(callback, validateFiles);
            }
            return {validateFiles, PDFValidationComponent: undefined};
        });
        await act(async () => {
            await Onyx.clear();
        });
        await signInWithTestUser(1, 'boundary@expensify.com');
        // withWritableReportOrNotFound uses the signed-in empty-report fallback. no permission mock.
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}boundary-tx`, transaction);
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        });
        await waitForBatchedUpdatesWithAct();
    });

    it.each([
        {name: SCREENS.MONEY_REQUEST.STEP_CONFIRMATION, flag: 'true', present: true, autoAssigned: true},
        {name: SCREENS.MONEY_REQUEST.STEP_CONFIRMATION, flag: undefined, present: false, autoAssigned: false},
        {name: SCREENS.MONEY_REQUEST.STEP_CONFIRMATION, flag: undefined, present: true, autoAssigned: false},
        {name: SCREENS.MONEY_REQUEST.CREATE, flag: undefined, present: false, autoAssigned: false},
        {name: SCREENS.MONEY_REQUEST.CREATE, flag: 'true', present: true, autoAssigned: false},
    ])('keeps name-first participant navigation for $name, flag=$flag, present=$present', async ({name, flag, present, autoAssigned}) => {
        // Given the actual receiver accepts the canonical action-bearing STEP params member with either incoming name.
        const params: MoneyRequestNavigatorParamList[typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION] = {
            action: CONST.IOU.ACTION.CREATE,
            iouType: CONST.IOU.TYPE.SUBMIT,
            transactionID: 'boundary-tx',
            reportID: '100',
            ...(present ? {participantsAutoAssigned: flag} : {}),
        };
        const route: React.ComponentProps<typeof IOURequestStepConfirmationContentWithWritableReportOrNotFound>['route'] = {key: 'confirmation', name, params};
        jest.mocked(useRoute).mockReturnValue(route);
        render(<ConfirmationBoundary route={route} />);
        await waitForBatchedUpdatesWithAct();
        await waitFor(() => {
            expect(getConfirmationReceiptCallback()).toEqual(expect.any(Function));
            expect(screen.queryAllByDisplayValue('Cafe').length + screen.queryAllByText('Cafe').length).toBeGreaterThan(0);
        });
        expect(screen.queryByTestId('NotFoundPage')).toBeNull();
        // When the actual mounted page header handles Back, independently of NotFound's own Back button.
        fireEvent.press(screen.getByLabelText('Back'));
        // Then only the STEP true flag keeps the existing stack. CREATE ignores an extraneous true flag.
        if (autoAssigned) {
            await waitFor(() => expect(Navigation.goBack).toHaveBeenCalledWith());
        } else {
            const base = ROUTES.MONEY_REQUEST_CREATE.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, 'boundary-tx', '100');
            const participantRoute = createDynamicRoute(
                DYNAMIC_ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute({action: CONST.IOU.ACTION.CREATE, iouType: CONST.IOU.TYPE.SUBMIT, transactionID: 'boundary-tx', reportID: '100'}),
                base,
            );
            await waitFor(() => expect(Navigation.goBack).toHaveBeenCalledWith(participantRoute, {compareParams: false}));
        }
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    describe.each([false, true])('public receiver standalone=%s', (standalone) => {
        it.each([CONST.IOU.TYPE.SUBMIT, CONST.IOU.TYPE.PAY, CONST.IOU.TYPE.SPLIT, CONST.IOU.TYPE.SPLIT_EXPENSE, CONST.IOU.TYPE.TRACK, CONST.IOU.TYPE.INVOICE, CONST.IOU.TYPE.CREATE])(
            'mounts actual canonical STEP content for %s',
            async (iouType) => {
                // Given each canonical category uses its actual withFullTransaction draft source.
                if (iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) {
                    await act(async () => {
                        await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}boundary-tx`, transaction);
                    });
                }
                const params = {action: CONST.IOU.ACTION.CREATE, iouType, transactionID: 'boundary-tx', reportID: '100'} satisfies React.ComponentProps<
                    typeof IOURequestStepConfirmation
                >['route']['params'];
                const route: React.ComponentProps<typeof IOURequestStepConfirmation>['route'] = {key: 'confirmation', name: SCREENS.MONEY_REQUEST.STEP_CONFIRMATION, params};
                // When the unchanged wrappers and real list mount through a normal typed public call.
                jest.mocked(useRoute).mockReturnValue(route);
                render(
                    <ConfirmationBoundary
                        route={route}
                        standalone={standalone}
                    />,
                );
                await waitForBatchedUpdatesWithAct();
                // Then required callback registration and list content prove actual acceptance, beyond a generic Back button.
                await waitFor(() => {
                    expect(getConfirmationReceiptCallback()).toEqual(expect.any(Function));
                    expect(screen.queryAllByDisplayValue('Cafe').length + screen.queryAllByText('Cafe').length).toBeGreaterThan(0);
                });
                expect(screen.queryByTestId('NotFoundPage')).toBeNull();
                if (standalone) {
                    expect(screen.getByTestId('IOURequestStepConfirmation')).toBeTruthy();
                }
            },
        );

        it('mounts canonical CREATE with an ordinary action-bearing receiver params member', async () => {
            // Given CREATE URL/StartPage supplies normal action and IDs while the receiver admits the STEP member.
            const params = {action: CONST.IOU.ACTION.CREATE, iouType: CONST.IOU.TYPE.SUBMIT, transactionID: 'boundary-tx', reportID: '100'} satisfies React.ComponentProps<
                typeof IOURequestStepConfirmation
            >['route']['params'];
            const route: React.ComponentProps<typeof IOURequestStepConfirmation>['route'] = {key: 'create', name: SCREENS.MONEY_REQUEST.CREATE, params};
            // When either real public receiver handles CREATE without an action suppression.
            jest.mocked(useRoute).mockReturnValue(route);
            render(
                <ConfirmationBoundary
                    route={route}
                    standalone={standalone}
                />,
            );
            await waitForBatchedUpdatesWithAct();
            // Then the real canonical list and callback mount and no IOU rejection is shown.
            await waitFor(() => {
                expect(getConfirmationReceiptCallback()).toEqual(expect.any(Function));
                expect(screen.queryAllByDisplayValue('Cafe').length + screen.queryAllByText('Cafe').length).toBeGreaterThan(0);
            });
            expect(screen.queryByTestId('NotFoundPage')).toBeNull();
        });

        describe.each([SCREENS.MONEY_REQUEST.CREATE, SCREENS.MONEY_REQUEST.STEP_CONFIRMATION])('legacy URI name=%s', (name) => {
            it.each([CONST.IOU.TYPE.REQUEST, CONST.IOU.TYPE.SEND])('keeps actual NotFound rejection for %s', async (iouType) => {
                // Given CREATE URI and manual-distance SEND provenance do not establish accepted confirmation content.
                const params: MoneyRequestNavigatorParamList[typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION] = {
                    action: CONST.IOU.ACTION.CREATE,
                    iouType: CONST.IOU.TYPE.SUBMIT,
                    transactionID: 'boundary-tx',
                    reportID: '100',
                };
                // @ts-expect-error -- Only the rejected legacy URI iouType violates the canonical member. action and IDs remain normally typed.
                params.iouType = iouType;
                const route: React.ComponentProps<typeof IOURequestStepConfirmation>['route'] = {key: 'legacy', name, params};
                const url = jest.spyOn(URL, 'createObjectURL');
                try {
                    // When the unchanged public wrappers receive the legacy value in the same signed-in draft state as controls.
                    jest.mocked(useRoute).mockReturnValue(route);
                    render(
                        <ConfirmationBoundary
                            route={route}
                            standalone={standalone}
                        />,
                    );
                    await waitForBatchedUpdatesWithAct();
                    expect(await screen.findByTestId('NotFoundPage')).toBeTruthy();
                    // Then no private content or callback runs, and real NotFound Back invokes the wrapper dismissal.
                    expect(screen.queryByTestId('IOURequestStepConfirmation')).toBeNull();
                    expect(screen.queryAllByDisplayValue('Cafe')).toHaveLength(0);
                    expect(screen.queryAllByText('Cafe')).toHaveLength(0);
                    expect(useFilesValidation).not.toHaveBeenCalled();
                    expect(screen.UNSAFE_queryAllByType(DragAndDropConsumer)).toHaveLength(0);
                    expect(url).not.toHaveBeenCalled();
                    expect(setMoneyRequestReceipt).not.toHaveBeenCalled();
                    fireEvent.press(screen.getByLabelText('Back'));
                    await waitFor(() => expect(Navigation.dismissModal).toHaveBeenCalledWith());
                    expect(Navigation.goBack).not.toHaveBeenCalled();
                } finally {
                    url.mockRestore();
                }
            });
        });
    });

    it.each(['files', 'later-metadata', 'blob', 'metadata-first', 'empty'] as const)('preserves first-only confirmation receipt delivery for %s', async (category) => {
        // Given canonical content registers its real callback through the unchanged wrappers.
        const route: React.ComponentProps<typeof IOURequestStepConfirmation>['route'] = {
            key: 'confirmation',
            name: SCREENS.MONEY_REQUEST.STEP_CONFIRMATION,
            params: {action: CONST.IOU.ACTION.CREATE, iouType: CONST.IOU.TYPE.SUBMIT, transactionID: 'boundary-tx', reportID: '100'},
        };
        jest.mocked(useRoute).mockReturnValue(route);
        render(<ConfirmationBoundary route={route} />);
        await waitForBatchedUpdatesWithAct();
        await waitFor(() => expect(getConfirmationReceiptCallback()).toEqual(expect.any(Function)));
        const callback = getConfirmationReceiptCallback();
        const first = new File(['first'], 'first.text', {type: 'text/plain'});
        const second = new File(['second'], 'second.text', {type: 'text/plain'});
        const blob = new Blob(['owned bytes'], {type: 'text/plain'});
        const metadata: FileObject = {uri: 'file://unsupported', name: 'metadata.text', type: 'text/plain', size: 240};
        let files: FileObject[] = [];
        if (category === 'files') {
            files = [first, second];
        } else if (category === 'later-metadata') {
            files = [first, metadata];
        } else if (category === 'blob') {
            files = [blob, second];
        } else if (category === 'metadata-first') {
            files = [metadata, first];
        }
        const url = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:first');
        try {
            // When each separate callback scenario keeps later entries outside the first-only proof.
            act(() => {
                callback(files, []);
            });
            // Then only the identical first File/Blob is written. absent Blob name keeps its original empty fallback.
            if (category === 'metadata-first' || category === 'empty') {
                expect(url).not.toHaveBeenCalled();
                expect(setMoneyRequestReceipt).not.toHaveBeenCalled();
            } else {
                expect(url.mock.calls).toEqual([[category === 'blob' ? blob : first]]);
                expect(setMoneyRequestReceipt).toHaveBeenCalledTimes(1);
                expect(setMoneyRequestReceipt).toHaveBeenCalledWith('boundary-tx', 'blob:first', category === 'blob' ? '' : 'first.text', true, 'text/plain');
            }
        } finally {
            url.mockRestore();
        }
    });
});
