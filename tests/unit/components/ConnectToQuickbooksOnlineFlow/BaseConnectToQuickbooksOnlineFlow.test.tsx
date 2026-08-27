import {act, render, waitFor} from '@testing-library/react-native';

import BaseConnectToQuickbooksOnlineFlow from '@components/ConnectToQuickbooksOnlineFlow/BaseConnectToQuickbooksOnlineFlow';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import useEnvironment from '@hooks/useEnvironment';

import {isAuthenticationError} from '@libs/actions/connections';

import {enablePolicyTaxes} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React from 'react';

const POLICY_ID = '123';
const POPOVER_POSITION = {horizontal: 100, vertical: 200};

type MockPopoverMenuProps = {
    isVisible: boolean;
    menuItems: PopoverMenuItem[];
    onItemSelected?: (item: PopoverMenuItem, index: number) => void;
};

const mockPopoverMenu = jest.fn<void, [MockPopoverMenuProps]>();
const mockCalculatePopoverPosition = jest.fn(() => Promise.resolve(POPOVER_POSITION));

jest.mock('@components/PopoverMenu', () => ({
    __esModule: true,
    default: (props: MockPopoverMenuProps) => {
        mockPopoverMenu(props);
        return null;
    },
}));

jest.mock('@hooks/useEnvironment', () => jest.fn());
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));
jest.mock('@hooks/usePopoverPosition', () =>
    jest.fn(() => ({
        calculatePopoverPosition: mockCalculatePopoverPosition,
    })),
);
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({LinkCopy: 'LinkCopy'})),
}));

jest.mock('@libs/actions/connections', () => ({
    isAuthenticationError: jest.fn(() => false),
}));

jest.mock('@pages/workspace/accounting/AccountingContext', () => ({
    useAccountingState: jest.fn(() => ({popoverAnchorRefs: undefined})),
}));

jest.mock('@userActions/Policy/Policy', () => ({
    enablePolicyTaxes: jest.fn(),
}));

const mockUseEnvironment = jest.mocked(useEnvironment);
const mockIsAuthenticationError = jest.mocked(isAuthenticationError);
const mockEnablePolicyTaxes = jest.mocked(enablePolicyTaxes);

function setEnvironment(environment: ValueOf<typeof CONST.ENVIRONMENT>) {
    mockUseEnvironment.mockReturnValue({
        environment,
        environmentURL: '',
        isProduction: environment === CONST.ENVIRONMENT.PRODUCTION,
        isDevelopment: environment === CONST.ENVIRONMENT.DEV,
    });
}

function renderFlow({isIntuitEnterpriseSuite = false, onConnect = jest.fn()} = {}) {
    render(
        <BaseConnectToQuickbooksOnlineFlow
            policyID={POLICY_ID}
            isIntuitEnterpriseSuite={isIntuitEnterpriseSuite}
            onConnect={onConnect}
        />,
    );

    return onConnect;
}

function selectPopoverItem(index: number) {
    const props = mockPopoverMenu.mock.calls.at(-1)?.[0];
    const item = props?.menuItems.at(index);
    if (!props || !item) {
        throw new Error(`Popover item ${index} was not rendered`);
    }

    // Match PopoverMenu's selection order. This catches wrappers that call the item's handler before PopoverMenu calls it itself.
    props.onItemSelected?.(item, index);
    item.onSelected?.();
}

describe('BaseConnectToQuickbooksOnlineFlow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setEnvironment(CONST.ENVIRONMENT.DEV);
        mockIsAuthenticationError.mockReturnValue(false);
    });

    it.each([
        ['QuickBooks Online in development', false, CONST.ENVIRONMENT.DEV, false],
        ['QuickBooks Online on staging', false, CONST.ENVIRONMENT.STAGING, false],
        ['Intuit Enterprise Suite on production', true, CONST.ENVIRONMENT.PRODUCTION, false],
        ['Intuit Enterprise Suite reconnect after an authentication error', true, CONST.ENVIRONMENT.DEV, true],
    ])('connects to production immediately for %s', async (_caseName, isIntuitEnterpriseSuite, environment, isAuthError) => {
        setEnvironment(environment);
        mockIsAuthenticationError.mockReturnValue(isAuthError);
        const onConnect = renderFlow({isIntuitEnterpriseSuite});

        await waitFor(() => {
            expect(onConnect).toHaveBeenCalledTimes(1);
        });

        expect(onConnect).toHaveBeenCalledWith(false);
        expect(mockPopoverMenu).not.toHaveBeenCalled();
    });

    it.each([
        ['development', CONST.ENVIRONMENT.DEV],
        ['staging', CONST.ENVIRONMENT.STAGING],
    ])('shows the connection options for Intuit Enterprise Suite on %s', async (_environmentName, environment) => {
        setEnvironment(environment);
        renderFlow({isIntuitEnterpriseSuite: true});

        await waitFor(() => {
            expect(mockPopoverMenu).toHaveBeenCalled();
        });
    });

    it.each([
        ['production', 0, false],
        ['sandbox', 1, true],
    ])('connects to %s once when selected for Intuit Enterprise Suite on staging', async (_connectionName, itemIndex, isSandbox) => {
        setEnvironment(CONST.ENVIRONMENT.STAGING);
        const onConnect = renderFlow({isIntuitEnterpriseSuite: true});

        await waitFor(() => {
            expect(mockPopoverMenu).toHaveBeenCalled();
        });

        expect(onConnect).not.toHaveBeenCalled();

        act(() => selectPopoverItem(itemIndex));

        expect(onConnect).toHaveBeenCalledTimes(1);
        expect(onConnect).toHaveBeenCalledWith(isSandbox);
    });

    it('disables policy taxes once when the flow starts', async () => {
        renderFlow();

        await waitFor(() => {
            expect(mockEnablePolicyTaxes).toHaveBeenCalledTimes(1);
        });

        expect(mockEnablePolicyTaxes).toHaveBeenCalledWith(POLICY_ID, false);
    });
});
