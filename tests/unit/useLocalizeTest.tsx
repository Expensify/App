import {renderHook} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

describe('useLocalize', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdatesWithAct();
    });

    function TestWrapper({children}: {children: React.ReactNode}) {
        return <LocaleContextProvider>{children}</LocaleContextProvider>;
    }

    describe('localeCompare', () => {
        it('should return -1 for descending comparison', async () => {
            const {result} = renderHook(() => useLocalize(), {
                wrapper: TestWrapper,
            });
            await waitForBatchedUpdatesWithAct();
            const ans = result.current.localeCompare('Da Vinci', 'Tesla');

            expect(ans).toBe(-1);
        });

        it('should return -1 for ascending comparison', async () => {
            const {result} = renderHook(() => useLocalize(), {
                wrapper: TestWrapper,
            });
            await waitForBatchedUpdatesWithAct();
            const ans = result.current.localeCompare('Zidane', 'Messi');

            expect(ans).toBe(1);
        });

        it('should return 0 for equal strings', async () => {
            const {result} = renderHook(() => useLocalize(), {
                wrapper: TestWrapper,
            });
            await waitForBatchedUpdatesWithAct();
            const ans = result.current.localeCompare('Cat', 'Cat');

            expect(ans).toBe(0);
        });

        it('should put uppercase letters first', async () => {
            const {result} = renderHook(() => useLocalize(), {
                wrapper: TestWrapper,
            });
            await waitForBatchedUpdatesWithAct();
            const ans = result.current.localeCompare('apple', 'Apple');

            expect(ans).toBe(1);
        });

        it('distinguishes spanish diacritic characters', async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES);
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useLocalize(), {
                wrapper: TestWrapper,
            });
            await waitForBatchedUpdatesWithAct();

            const input = ['zorro', 'árbol', 'jalapeño', 'jalapeno', 'nino', 'niño'];

            input.sort(result.current.localeCompare);

            expect(input).toEqual(['árbol', 'jalapeno', 'jalapeño', 'nino', 'niño', 'zorro']);
        });
    });
});
