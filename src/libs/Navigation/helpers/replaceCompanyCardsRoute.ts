import type {Route as Routes} from '@src/ROUTES';

const replaceCompanyCardsRoute = (route: string): Routes => {
    return route?.replace(/\/edit\/export$/, '') as Routes;
};
export default replaceCompanyCardsRoute;
