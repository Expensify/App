type AuthenticatePusherParams = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    socket_id: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    channel_name: string;
    shouldRetry: boolean;
    forceNetworkRequest: boolean;
};

export default AuthenticatePusherParams;
