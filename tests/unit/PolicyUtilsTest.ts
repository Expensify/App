import * as PolicyUtils from '@libs/PolicyUtils';

function toLocaleDigitMock(dot: string): string {
    return dot;
}

describe('PolicyUtils', () => {
    describe('getRateDisplayValue', () => {
        it('should return an empty string for NaN', () => {
            const rate = PolicyUtils.getRateDisplayValue('invalid' as unknown as number, toLocaleDigitMock);
            expect(rate).toEqual('');
        });

        describe('withDecimals = false', () => {
            it('should return integer value as is', () => {
                const rate = PolicyUtils.getRateDisplayValue(100, toLocaleDigitMock);
                expect(rate).toEqual('100');
            });

            it('should return non-integer value as is', () => {
                const rate = PolicyUtils.getRateDisplayValue(10.5, toLocaleDigitMock);
                expect(rate).toEqual('10.5');
            });
        });

        describe('withDecimals = true', () => {
            it('should return integer value with 2 trailing zeros', () => {
                const rate = PolicyUtils.getRateDisplayValue(10, toLocaleDigitMock, true);
                expect(rate).toEqual('10.00');
            });

            it('should return non-integer value with up to 2 trailing zeros', () => {
                const rate = PolicyUtils.getRateDisplayValue(10.5, toLocaleDigitMock, true);
                expect(rate).toEqual('10.50');
            });

            it('should return non-integer value with 3 decimals as is', () => {
                const rate = PolicyUtils.getRateDisplayValue(10.531, toLocaleDigitMock, true);
                expect(rate).toEqual('10.531');
            });

            it('should return non-integer value with 3+ decimals cut to 3', () => {
                const rate = PolicyUtils.getRateDisplayValue(10.531345, toLocaleDigitMock, true);
                expect(rate).toEqual('10.531');
            });
        });
    });
});
