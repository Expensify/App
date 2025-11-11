type RespondToProactiveAppReviewParams = {
    response: 'positive' | 'negative' | 'skip';
    optimisticReportActionID?: number;
};

export default RespondToProactiveAppReviewParams;

