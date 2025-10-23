import type {Route as Routes} from '@src/ROUTES';

const replaceCompanyCardsRoute = (route: string): Routes => {
    return route?.replaceAll(/\/edit\/export$/, '') as Routes;
};
export default replaceCompanyCardsRoute;
