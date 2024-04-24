type UserSession = {
    email: string | undefined;
    accountID: number | undefined;
};

type NavigationProperties = {
    path: string;
};

export type {UserSession, NavigationProperties};
