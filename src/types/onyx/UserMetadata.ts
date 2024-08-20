/** Model of user metadata */
type UserMetadata = {
    /** Type of user plan */
    planType?: string;

    /** Type of user role */
    role?: string;

    /** Whether the user is on a free trial */
    freeTrial?: boolean;

    /** User's account ID */
    accountID?: number;

    /** User email so we can filter out certain accounts */
    email?: string;

    /** Type of environment the user is using (staging or production) */
    environment?: string;

    /** Information if user dismissed the try new dot popup before. Can be "empty", true or false */
    tryNewDotDismissed?: 'empty' | boolean;
};

export default UserMetadata;
