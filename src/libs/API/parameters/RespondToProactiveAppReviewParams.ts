type RespondToProactiveAppReviewParams = {
    response: 'positive' | 'negative' | 'skip';
    optimisticReportActionID?: string;
    conciergeChatReportID?: string;
};

export default RespondToProactiveAppReviewParams;
