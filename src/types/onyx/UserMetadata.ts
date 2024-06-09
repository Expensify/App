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

    /** Type of environment the user is using (staging or production) */
    environment?: string;
};

export default UserMetadata;
