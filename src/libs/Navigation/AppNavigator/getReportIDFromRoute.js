function getReportIDFromRoute(route) {
    if (route.params && route.params.reportID) {
        return route.params.reportID.toString();
    }
    return null;
}

export default getReportIDFromRoute;
