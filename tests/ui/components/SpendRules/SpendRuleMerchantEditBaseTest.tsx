import {act, render} from '@testing-library/react-native';

import SpendRuleMerchantEditBase from '@components/SpendRules/configuration/SpendRuleMerchantEditBase';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

type FormProviderMockProps = {children?: React.ReactNode; onSubmit?: () => void};
type InputWrapperMockProps = {onChangeText?: (value: string) => void};
type ChildrenOnly = {children?: React.ReactNode};

// Captured callbacks across mocks let us drive the form imperatively without rendering the real FormProvider chain.
let capturedSubmit: (() => void) | null = null;
let capturedOnChangeText: ((value: string) => void) | null = null;

const mockGoBack = jest.fn<void, [route?: unknown, options?: {shouldSkipFocusRestore?: boolean}]>();

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        goBack: (route?: unknown, options?: {shouldSkipFocusRestore?: boolean}) => {
            mockGoBack(route, options);
        },
    },
}));

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, formatPhoneNumber: (phone: string) => phone, preferredLocale: 'en'}));
jest.mock('@hooks/useThemeStyles', () => () => new Proxy({}, {get: () => ({})}));
jest.mock('@hooks/useCanWriteCardSpendRules', () => () => true);
jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: () => {}}));

jest.mock('@components/Form/FormProvider', () => ({
    __esModule: true,
    default: ({children, onSubmit}: FormProviderMockProps) => {
        capturedSubmit = onSubmit ?? null;
        return children;
    },
}));

jest.mock('@components/Form/InputWrapper', () => ({
    __esModule: true,
    default: ({onChangeText}: InputWrapperMockProps) => {
        capturedOnChangeText = onChangeText ?? null;
        return null;
    },
}));

jest.mock('@components/HeaderWithBackButton', () => ({__esModule: true, default: () => null}));
jest.mock('@components/ScreenWrapper', () => ({__esModule: true, default: ({children}: ChildrenOnly) => children}));
jest.mock('@components/SelectionList', () => ({__esModule: true, default: () => null}));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => ({__esModule: true, default: () => null}));
jest.mock('@components/Text', () => ({__esModule: true, default: () => null}));
jest.mock('@components/TextInput', () => ({__esModule: true, default: () => null}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({__esModule: true, default: ({children}: ChildrenOnly) => children}));

type EditProps = Parameters<typeof SpendRuleMerchantEditBase>[0];

function renderEdit(props: Partial<EditProps> = {}, onMerchantDataChange = jest.fn()) {
    const defaults: EditProps = {
        policyID: 'policy-1',
        merchantIndex: '0',
        merchantNames: ['Acme'],
        merchantMatchTypes: [CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS],
        onMerchantDataChange,
    };
    const result = render(
        <SpendRuleMerchantEditBase
            {...defaults}
            {...props}
        />,
    );
    return {...result, onMerchantDataChange};
}

beforeEach(() => {
    capturedSubmit = null;
    capturedOnChangeText = null;
    mockGoBack.mockReset();
});

describe('SpendRuleMerchantEditBase.submit — Navigation.goBack fires with {shouldSkipFocusRestore: true} on every submit-driven path (#90838 class)', () => {
    it('delete branch (existing merchant, empty name): skips restore, navigates back, and filters the row out', () => {
        const {onMerchantDataChange} = renderEdit({
            merchantIndex: '0',
            merchantNames: ['Acme', 'Globex'],
            merchantMatchTypes: [CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS, CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO],
        });

        act(() => capturedOnChangeText?.(''));
        capturedSubmit?.();

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith(undefined, {shouldSkipFocusRestore: true});
        expect(onMerchantDataChange).toHaveBeenCalledWith(['Globex'], [CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO]);
    });

    it('cancel-on-new (new-merchant flow, empty name): still skips restore even though onMerchantDataChange is NOT invoked — the destination form Save button must not be hijacked', () => {
        const {onMerchantDataChange} = renderEdit({merchantIndex: ROUTES.NEW, merchantNames: ['Acme'], merchantMatchTypes: [CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS]});

        capturedSubmit?.();

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith(undefined, {shouldSkipFocusRestore: true});
        expect(onMerchantDataChange).not.toHaveBeenCalled();
    });

    it('rename (existing merchant, non-empty name): skips restore, navigates back, and replaces only the indexed row — defends the Codex-caught Enter-hijack on the destination list', () => {
        const {onMerchantDataChange} = renderEdit({
            merchantIndex: '0',
            merchantNames: ['Acme', 'Globex'],
            merchantMatchTypes: [CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS, CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO],
        });

        act(() => capturedOnChangeText?.('Acme Inc'));
        capturedSubmit?.();

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith(undefined, {shouldSkipFocusRestore: true});
        expect(onMerchantDataChange).toHaveBeenCalledWith(['Acme Inc', 'Globex'], [CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS, CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO]);
    });

    it('new-merchant add (new flow, non-empty name): skips restore, navigates back, and appends to the arrays — same Enter-hijack defense', () => {
        const {onMerchantDataChange} = renderEdit({merchantIndex: ROUTES.NEW, merchantNames: ['Acme'], merchantMatchTypes: [CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS]});

        act(() => capturedOnChangeText?.('Globex'));
        capturedSubmit?.();

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith(undefined, {shouldSkipFocusRestore: true});
        expect(onMerchantDataChange).toHaveBeenCalledWith(['Acme', 'Globex'], [CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS, CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS]);
    });
});
