import {render, renderHook, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import ReceiptAudit from '@components/ReceiptAudit';

import useTheme from '@hooks/useTheme';

import CONST from '@src/CONST';

import React from 'react';

import {translateLocal} from '../../utils/TestHelper';

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({})),
}));

describe('ReceiptAudit', () => {
    it('excludes the receipt label from browser and scraper selection', () => {
        // Given a receipt audit label in an expense details row

        // When the receipt audit is rendered
        render(
            <LocaleContextProvider>
                <ReceiptAudit
                    notes={[]}
                    shouldShowAuditResult={false}
                />
            </LocaleContextProvider>,
        );

        // Then the label cannot be selected by the browser or included by SelectionScraper
        const receiptLabel = screen.getByText(translateLocal('common.receipt'));
        expect(receiptLabel).toHaveStyle({userSelect: 'none'});
        expect(receiptLabel).toHaveProp('dataSet', {[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true});
    });

    it('heads the receipt like the other sections, with the audit result muted beside it', () => {
        // Given a receipt the audit found an issue with
        const mutedColor = renderHook(() => useTheme()).result.current.textSupporting;

        // When the receipt audit is rendered
        render(
            <LocaleContextProvider>
                <ReceiptAudit
                    notes={['Receipt is missing a date']}
                    shouldShowAuditResult
                />
            </LocaleContextProvider>,
        );

        // Then "Receipt" reads as a heading like "Details", and only the audit result stays muted
        expect(screen.getByText(translateLocal('common.receipt'))).not.toHaveStyle({color: mutedColor});
        expect(screen.getByText(new RegExp(translateLocal('iou.receiptIssuesFound', {count: 1})))).toHaveStyle({color: mutedColor});
    });
});
