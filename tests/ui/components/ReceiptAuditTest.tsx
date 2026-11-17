import {render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import ReceiptAudit from '@components/ReceiptAudit';

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
});
