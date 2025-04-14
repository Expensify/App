import {renderHook} from '@testing-library/react-native';
import useActiveRoute from '@hooks/useActiveRoute';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

describe('useActiveRoute', () => {
    it('should return the same active route', () => {
        // Given an active route
        const navigation = jest.spyOn(Navigation, 'getReportRHPActiveRoute');
        const {result} = renderHook(() => useActiveRoute());
        const expectedActiveRoute = ROUTES.SEARCH_REPORT.getRoute({reportID: '1'});
        navigation.mockReturnValueOnce(expectedActiveRoute);

        const actualActiveRoute = result.current.getReportRHPActiveRoute();
        expect(actualActiveRoute).toBe(expectedActiveRoute);

        // When getting the active route multiple times
        navigation.mockReturnValueOnce(ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.CREATE, '1', '1'));
        const actualActiveRoute2 = result.current.getReportRHPActiveRoute();

        // Then it should return the first active route value
        expect(actualActiveRoute2).toBe(expectedActiveRoute);
    });
});
