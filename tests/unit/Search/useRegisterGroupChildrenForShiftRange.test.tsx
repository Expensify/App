import {renderHook} from '@testing-library/react-native';

import {SearchShiftRangeChildrenContext} from '@components/Search/SearchContextDefinitions';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import useRegisterGroupChildrenForShiftRange from '@components/Search/SearchList/ListItem/useRegisterGroupChildrenForShiftRange';

import CONST from '@src/CONST';

import React from 'react';

import createRandomTransaction from '../../utils/collections/transaction';

function makeChild(index: number, key: string): TransactionListItemType {
    return {
        ...createRandomTransaction(index),
        errors: undefined,
        report: undefined,
        policy: undefined,
        reportAction: undefined,
        holdReportAction: undefined,
        from: {accountID: index},
        to: {accountID: index},
        formattedFrom: '',
        formattedTo: '',
        formattedTotal: 0,
        formattedMerchant: '',
        date: '',
        shouldShowMerchant: false,
        shouldShowYear: false,
        shouldShowYearSubmitted: false,
        shouldShowYearApproved: false,
        shouldShowYearPosted: false,
        shouldShowYearExported: false,
        isAmountColumnWide: false,
        isTaxAmountColumnWide: false,
        keyForList: key,
        transactionID: key,
        allActions: [CONST.SEARCH.ACTION_TYPES.VIEW],
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        canPay: false,
        canApprove: false,
        canSubmit: false,
        canChangeApprover: false,
    };
}

const CHILDREN: TransactionListItemType[] = [makeChild(1, 'a'), makeChild(2, 'b')];

function setup() {
    const registerGroupChildren = jest.fn();
    const unregisterGroupChildren = jest.fn();
    const wrapper = ({children}: {children: React.ReactNode}) => (
        <SearchShiftRangeChildrenContext value={{registerGroupChildren, unregisterGroupChildren}}>{children}</SearchShiftRangeChildrenContext>
    );
    return {registerGroupChildren, unregisterGroupChildren, wrapper};
}

describe('useRegisterGroupChildrenForShiftRange', () => {
    it('registers the children under the group key when it should register and there are children', () => {
        const {registerGroupChildren, unregisterGroupChildren, wrapper} = setup();
        renderHook(() => useRegisterGroupChildrenForShiftRange('group-1', CHILDREN, true), {wrapper});
        expect(registerGroupChildren).toHaveBeenCalledWith('group-1', CHILDREN);
        expect(unregisterGroupChildren).not.toHaveBeenCalled();
    });

    it('unregisters (never registers) when shouldRegister is false', () => {
        const {registerGroupChildren, unregisterGroupChildren, wrapper} = setup();
        renderHook(() => useRegisterGroupChildrenForShiftRange('group-1', CHILDREN, false), {wrapper});
        expect(registerGroupChildren).not.toHaveBeenCalled();
        expect(unregisterGroupChildren).toHaveBeenCalledWith('group-1');
    });

    it('unregisters (never registers) when there are no children', () => {
        const {registerGroupChildren, unregisterGroupChildren, wrapper} = setup();
        renderHook(() => useRegisterGroupChildrenForShiftRange('group-1', [], true), {wrapper});
        expect(registerGroupChildren).not.toHaveBeenCalled();
        expect(unregisterGroupChildren).toHaveBeenCalledWith('group-1');
    });

    it('keeps the registration on unmount — FlashList recycling must not drop an off-screen expanded group from the range source', () => {
        const {unregisterGroupChildren, wrapper} = setup();
        const {unmount} = renderHook(() => useRegisterGroupChildrenForShiftRange('group-1', CHILDREN, true), {wrapper});
        unmount();
        expect(unregisterGroupChildren).not.toHaveBeenCalled();
    });

    it('keeps the old group registered when the row is recycled to render another group', () => {
        const {registerGroupChildren, unregisterGroupChildren, wrapper} = setup();
        const {rerender} = renderHook(({groupKey}) => useRegisterGroupChildrenForShiftRange(groupKey, CHILDREN, true), {wrapper, initialProps: {groupKey: 'group-1'}});
        rerender({groupKey: 'group-2'});
        expect(registerGroupChildren).toHaveBeenLastCalledWith('group-2', CHILDREN);
        expect(unregisterGroupChildren).not.toHaveBeenCalled();
    });

    it('re-registers when the children change', () => {
        const {registerGroupChildren, wrapper} = setup();
        const {rerender} = renderHook(({children}) => useRegisterGroupChildrenForShiftRange('group-1', children, true), {wrapper, initialProps: {children: CHILDREN}});
        const nextChildren: TransactionListItemType[] = [...CHILDREN, makeChild(3, 'c')];
        rerender({children: nextChildren});
        expect(registerGroupChildren).toHaveBeenLastCalledWith('group-1', nextChildren);
    });
});
