type AuthenticatePusherParams = {
    /* oxlint-disable-next-line hosted/naming-convention */ // eslint-disable-next-line @typescript-eslint/naming-convention
    socket_id: string;
    /* oxlint-disable-next-line hosted/naming-convention */ // eslint-disable-next-line @typescript-eslint/naming-convention
    channel_name: string;
    shouldRetry: boolean;
    forceNetworkRequest: boolean;
};

export default AuthenticatePusherParams;
