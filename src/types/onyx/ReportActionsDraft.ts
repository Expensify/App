/** Model of a report action draft */
type ReportActionsDraft =
    | {
          /** Chat message content */
          message: string;
      }
    | string;

export default ReportActionsDraft;
