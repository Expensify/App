import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ScrollView from '@components/ScrollView';

import RejectReasonFormView from '@pages/iou/RejectReasonFormView';
import RejectExpenseReportPage from '@pages/RejectExpenseReportPage';

import type * as ReactNative from 'react-native';

import createMock from '@tests/utils/createMock';
import React from 'react';

type FormProviderMockProps = {
    children?: React.ReactNode;
    submitFlexEnabled?: boolean;
};

type InputWrapperMockProps = {
    autoGrowHeight?: boolean;
    maxAutoGrowHeight?: number;
};

type SelectionListMockProps = {
    data?: Array<{accountID?: number}>;
};

type MeasureCallback = (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void;

const mockFormProvider = jest.fn<void, [FormProviderMockProps]>();
const mockInputWrapper = jest.fn<void, [InputWrapperMockProps]>();
const mockSelectionList = jest.fn<void, [SelectionListMockProps]>();
const mockUseOnyx = jest.fn<unknown, unknown[]>();
const measuredContentHeights: number[] = [];
const mockMeasure = jest.fn<void, [MeasureCallback]>((callback) => {
    callback(0, 0, 0, measuredContentHeights.shift() ?? 0, 0, 0);
});

const createNodeMock = () => ({
    measure: mockMeasure,
});

jest.mock('@components/Form/FormProvider', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    return {
        __esModule: true,
        default: (props: FormProviderMockProps) => {
            mockFormProvider(props);
            return MockReact.createElement(MockReact.Fragment, null, props.children);
        },
    };
});
jest.mock('@components/Form/InputWrapper', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const MockReactNative = jest.requireActual<typeof ReactNative>('react-native');
    return {
        __esModule: true,
        default: (props: InputWrapperMockProps) => {
            mockInputWrapper(props);
            return MockReact.createElement(MockReactNative.View, {testID: 'input-wrapper'});
        },
    };
});
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/ScreenWrapper', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    return {__esModule: true, default: ({children}: {children?: React.ReactNode}) => MockReact.createElement(MockReact.Fragment, null, children)};
});
jest.mock('@components/SelectionList', () => (props: SelectionListMockProps) => {
    mockSelectionList(props);
    return null;
});
jest.mock('@components/SelectionList/ListItem/UserListItem', () => () => null);
jest.mock('@components/Text', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    return {__esModule: true, default: ({children}: {children?: React.ReactNode}) => MockReact.createElement(MockReact.Fragment, null, children)};
});
jest.mock('@components/TextInput', () => () => null);
jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessState: () => ({isDelegateAccessRestricted: false}),
    useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: jest.fn()}),
}));
jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: jest.fn()}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1}));
jest.mock('@hooks/useDelegateAccountID', () => () => undefined);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, formatPhoneNumber: (value: string) => value}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: (...args: unknown[]) => mockUseOnyx(...args)}));
jest.mock('@hooks/useThemeStyles', () => () => ({flex1: {}, flexGrow1: {}, overflowHidden: {}, ph5: {}, mb3: {}, mb6: {}, mhn5: {}}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {goBack: jest.fn()}}));
jest.mock('@libs/PersonalDetailsUtils', () => ({
    getPersonalDetailByEmail: (email?: string) => {
        if (!email) {
            return undefined;
        }
        return {accountID: email === 'approver@example.com' ? 3 : 2, login: email};
    },
    temporaryGetDisplayNameOrDefault: () => 'Submitter',
}));
jest.mock('@userActions/IOU/RejectMoneyRequest', () => ({rejectExpenseReport: jest.fn()}));

async function measureAvailableHeightAndReserveValidationRow() {
    const inputWrapper = screen.getByTestId('input-wrapper');
    const content = inputWrapper.parent;
    if (!content) {
        throw new Error('Expected the rejection input to have a content container');
    }
    const container = screen.UNSAFE_getByType(ScrollView);

    measuredContentHeights.push(420);
    fireEvent(container, 'layout', {nativeEvent: {layout: {height: 420}}});
    await waitFor(() => expect(mockInputWrapper.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({maxAutoGrowHeight: 420})));
    await waitFor(() => expect(mockMeasure).toHaveBeenCalledTimes(1));

    measuredContentHeights.push(76);
    fireEvent(content, 'layout', {nativeEvent: {layout: {height: 444}}});
    await waitFor(() => expect(mockInputWrapper.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({maxAutoGrowHeight: 396})));
}

function getReportPageProps(): React.ComponentProps<typeof RejectExpenseReportPage> {
    return createMock<React.ComponentProps<typeof RejectExpenseReportPage>>({route: {params: {reportID: '1'}}});
}

describe('RHP rejection reason inputs', () => {
    beforeEach(() => {
        mockFormProvider.mockClear();
        mockInputWrapper.mockClear();
        mockSelectionList.mockClear();
        mockUseOnyx.mockReset();
        mockMeasure.mockClear();
        measuredContentHeights.length = 0;
    });

    it('passes the measured available height to the transaction rejection input', async () => {
        render(
            <RejectReasonFormView
                onSubmit={jest.fn()}
                validate={jest.fn(() => ({}))}
            />,
            {createNodeMock},
        );

        expect(mockFormProvider.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({submitFlexEnabled: false}));
        expect(mockInputWrapper.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({autoGrowHeight: true}));
        await measureAvailableHeightAndReserveValidationRow();
    });

    it('passes the measured available height to the report rejection input', async () => {
        mockUseOnyx
            .mockReturnValueOnce([{reportID: '1', ownerAccountID: 2}])
            .mockReturnValueOnce([undefined])
            .mockReturnValueOnce([{submitterEmail: 'submitter@example.com', lastForwardedActorEmail: undefined}])
            .mockReturnValueOnce([false]);

        render(<RejectExpenseReportPage {...getReportPageProps()} />, {createNodeMock});

        expect(mockFormProvider.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({submitFlexEnabled: false}));
        expect(mockInputWrapper.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({autoGrowHeight: true}));
        await measureAvailableHeightAndReserveValidationRow();
    });

    it('keeps the optional previous-approver selector outside the measured report input', async () => {
        mockUseOnyx
            .mockReturnValueOnce([{reportID: '1', ownerAccountID: 2}])
            .mockReturnValueOnce([3])
            .mockReturnValueOnce([{submitterEmail: 'submitter@example.com', lastForwardedActorEmail: 'approver@example.com'}])
            .mockReturnValueOnce([false]);

        render(<RejectExpenseReportPage {...getReportPageProps()} />, {createNodeMock});

        expect(mockInputWrapper.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({autoGrowHeight: true}));
        await measureAvailableHeightAndReserveValidationRow();
        expect(mockSelectionList).toHaveBeenCalledWith(expect.objectContaining({data: expect.arrayContaining([expect.objectContaining({accountID: 3})])}));
    });
});
