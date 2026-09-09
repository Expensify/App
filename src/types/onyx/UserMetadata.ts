/** Model of user metadata */
type UserMetadata = {
    planType?: string;
    role?: string;
    freeTrial?: boolean;
    accountID?: number;

    /** User email so we can filter out certain accounts */
    email?: string;

    /** Type of environment the user is using (staging or production) */
    environment?: string;

    /** Information if user dismissed the try new dot popup before. Can be "empty", true or false */
    tryNewDotDismissed?: 'empty' | boolean;

    freeTrialStartDate?: string;
    freeTrialEndDate?: string;

    /** Information if the user is a paid member in any policy they're part of */
    paidMember?: boolean;
};

export default UserMetadata;
