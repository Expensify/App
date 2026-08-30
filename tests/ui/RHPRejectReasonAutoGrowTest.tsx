import {render} from '@testing-library/react-native';

import RejectReasonFormView from '@pages/iou/RejectReasonFormView';
import RejectExpenseReportPage from '@pages/RejectExpenseReportPage';

import React from 'react';
import {View} from 'react-native';

import createMock from '../utils/createMock';

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

type AutoGrowContainerMockProps = {
    children: (maxAutoGrowHeight: number) => React.ReactNode;
};

const MockView = View;
const mockAutoGrowContainer = jest.fn<void, [AutoGrowContainerMockProps]>();
const mockFormProvider = jest.fn<void, [FormProviderMockProps]>();
const mockInputWrapper = jest.fn<void, [InputWrapperMockProps]>();
const mockSelectionList = jest.fn<void, [SelectionListMockProps]>();
const mockUseOnyx = jest.fn<unknown, unknown[]>();

jest.mock('@components/AutoGrowHeightInputContainer', () => ({
    __esModule: true,
    default: (props: AutoGrowContainerMockProps) => {
        const MockReact = jest.requireActual<typeof React>('react');
        mockAutoGrowContainer(props);
        return MockReact.createElement(MockView, {testID: 'auto-grow-container'}, props.children(396));
    },
}));

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
    return {
        __esModule: true,
        default: (props: InputWrapperMockProps) => {
            mockInputWrapper(props);
            return MockReact.createElement(MockView, {testID: 'input-wrapper'});
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

function expectMeasuredHeightPropagation() {
    expect(mockAutoGrowContainer).toHaveBeenCalled();
    expect(mockInputWrapper.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({maxAutoGrowHeight: 396}));
}

function getReportPageProps(): React.ComponentProps<typeof RejectExpenseReportPage> {
    return createMock<React.ComponentProps<typeof RejectExpenseReportPage>>({route: {params: {reportID: '1'}}});
}

describe('RHP rejection reason inputs', () => {
    beforeEach(() => {
        mockAutoGrowContainer.mockClear();
        mockFormProvider.mockClear();
        mockInputWrapper.mockClear();
        mockSelectionList.mockClear();
        mockUseOnyx.mockReset();
    });

    it('passes the measured available height to the transaction rejection input', () => {
        render(
            <RejectReasonFormView
                onSubmit={jest.fn()}
                validate={jest.fn(() => ({}))}
            />,
        );

        expect(mockFormProvider.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({submitFlexEnabled: false}));
        expect(mockInputWrapper.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({autoGrowHeight: true}));
        expectMeasuredHeightPropagation();
    });

    it('passes the measured available height to the report rejection input', () => {
        mockUseOnyx
            .mockReturnValueOnce([{reportID: '1', ownerAccountID: 2}])
            .mockReturnValueOnce([undefined])
            .mockReturnValueOnce([{submitterEmail: 'submitter@example.com', lastForwardedActorEmail: undefined}])
            .mockReturnValueOnce([false]);

        render(<RejectExpenseReportPage {...getReportPageProps()} />);

        expect(mockFormProvider.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({submitFlexEnabled: false}));
        expect(mockInputWrapper.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({autoGrowHeight: true}));
        expectMeasuredHeightPropagation();
    });

    it('keeps the optional previous-approver selector outside the measured report input', () => {
        mockUseOnyx
            .mockReturnValueOnce([{reportID: '1', ownerAccountID: 2}])
            .mockReturnValueOnce([3])
            .mockReturnValueOnce([{submitterEmail: 'submitter@example.com', lastForwardedActorEmail: 'approver@example.com'}])
            .mockReturnValueOnce([false]);

        render(<RejectExpenseReportPage {...getReportPageProps()} />);

        expect(mockInputWrapper.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({autoGrowHeight: true}));
        expectMeasuredHeightPropagation();
        expect(mockSelectionList).toHaveBeenCalledWith(expect.objectContaining({data: expect.arrayContaining([expect.objectContaining({accountID: 3})])}));
    });
});
