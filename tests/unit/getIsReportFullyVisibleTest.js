import getIsReportFullyVisible from '../../src/libs/getIsReportFullyVisible';
import Visibility from '../../src/libs/Visibility';

describe('getIsReportFullyVisible', () => {
    describe('when Visibility.isVisible() is true', () => {
        beforeEach(() => {
            jest.spyOn(Visibility, 'isVisible').mockReturnValue(true);
        });

        it.each`
            isDrawerOpen | isSmallScreenWidth | expectedResult
            ${false}     | ${false}           | ${true}
            ${true}      | ${false}           | ${true}
            ${false}     | ${true}            | ${true}
            ${true}      | ${true}            | ${false}
        `('returns $expectedResult when isDrawerOpen is $isDrawerOpen and isSmallScreenWidth is $isSmallScreenWidth', ({isDrawerOpen, isSmallScreenWidth, expectedResult}) => {
            expect(getIsReportFullyVisible(isDrawerOpen, isSmallScreenWidth)).toBe(expectedResult);
        });
    });

    describe('when Visibility.isVisible() is false', () => {
        beforeEach(() => {
            jest.spyOn(Visibility, 'isVisible').mockReturnValue(false);
        });

        it.each`
            isDrawerOpen | isSmallScreenWidth | expectedResult
            ${false}     | ${false}           | ${false}
            ${true}      | ${false}           | ${false}
            ${false}     | ${true}            | ${false}
            ${true}      | ${true}            | ${false}
        `('returns $expectedResult when isDrawerOpen is $isDrawerOpen and isSmallScreenWidth is $isSmallScreenWidth', ({isDrawerOpen, isSmallScreenWidth, expectedResult}) => {
            expect(getIsReportFullyVisible(isDrawerOpen, isSmallScreenWidth)).toBe(expectedResult);
        });
    });
});
