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

    /** User environment identifier */
    environment?: string;
};

export default UserMetadata;
