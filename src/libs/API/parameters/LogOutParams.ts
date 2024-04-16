type LogOutParams = {
    authToken: string | null;
    partnerUserID: string;
    partnerName: string;
    partnerPassword: string;
    shouldRetry: boolean;
};

export default LogOutParams;
