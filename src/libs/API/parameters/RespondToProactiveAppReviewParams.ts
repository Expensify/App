type RespondToProactiveAppReviewParams = {
    response: 'positive' | 'negative' | 'skip';
    optimisticReportActionID?: string;
};

export default RespondToProactiveAppReviewParams;
