/** Model for tracking the Concierge streaming response on a report, keyed by reportActionID */
type ReportConciergeStream = {
    /** The accumulated HTML content being streamed */
    html: string;

    /** Whether the stream is complete */
    isFinal?: boolean;
};

export default ReportConciergeStream;
