import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

export default function openSearchReport(reportID: string, backTo: string) {
    requestAnimationFrame(() => Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo})));
}
