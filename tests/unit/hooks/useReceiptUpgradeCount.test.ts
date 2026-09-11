import {act, renderHook} from '@testing-library/react-native';

import useReceiptUpgradeCount from '@hooks/useReceiptUpgradeCount';

import {finish, recordUpgrade, start} from '@libs/ReceiptStorage/receiptUpgrades';

const FOLDER = 'file:///var/mobile/Containers/Data/Application/AAAA/Documents/Receipts-Upload';
const DURABLE_NAME = 'receipt_1234.jpg';
const RECEIPT_URI = `${FOLDER}/${DURABLE_NAME}`;

describe('useReceiptUpgradeCount', () => {
    it('reports nothing for a receipt that has never been upgraded', () => {
        const {result} = renderHook(() => useReceiptUpgradeCount(`${FOLDER}/receipt_untouched.jpg`));

        expect(result.current).toBe(0);
    });

    it('reports nothing for a view that has no source yet', () => {
        const {result} = renderHook(() => useReceiptUpgradeCount(undefined));

        expect(result.current).toBe(0);
    });

    it('goes up when the receipt behind the path is replaced, since the path itself never changes', () => {
        const {result} = renderHook(() => useReceiptUpgradeCount(RECEIPT_URI));

        expect(result.current).toBe(0);

        act(() => {
            start(DURABLE_NAME);
            recordUpgrade(DURABLE_NAME);
            finish(DURABLE_NAME);
        });

        expect(result.current).toBe(1);
    });

    it('stays put for an upgrade that finished without replacing the file', () => {
        const name = 'receipt_kept_its_snapshot.jpg';
        const {result} = renderHook(() => useReceiptUpgradeCount(`${FOLDER}/${name}`));

        act(() => {
            start(name);
            finish(name);
        });

        expect(result.current).toBe(0);
    });

    it('reads the same count back from a source it has already handed out', () => {
        const name = 'receipt_handed_back.jpg';
        act(() => {
            start(name);
            recordUpgrade(name);
            finish(name);
        });

        // A view passes the source it was given straight back in. Keying on the fragment or the query would
        // make that look like a different receipt every time the file changed.
        const {result: plain} = renderHook(() => useReceiptUpgradeCount(`${FOLDER}/${name}`));
        const {result: withFragment} = renderHook(() => useReceiptUpgradeCount(`${FOLDER}/${name}#upgraded1`));
        const {result: withQuery} = renderHook(() => useReceiptUpgradeCount(`${FOLDER}/${name}?v=1`));

        expect(plain.current).toBe(1);
        expect(withFragment.current).toBe(1);
        expect(withQuery.current).toBe(1);
    });
});
