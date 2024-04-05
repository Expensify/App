type Response = {
    credential: string;
};

type Initialize = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_id: string;
    callback: (response: Response) => void;
};

type Options = {
    theme?: 'outline';
    size?: 'large';
    type?: 'standard' | 'icon';
    shape?: 'circle' | 'pill';
    width?: string;
};

type Google = {
    accounts: {
        id: {
            initialize: ({client_id, callback}: Initialize) => void;
            renderButton: (client_id, options: Options) => void;
        };
    };
};

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        google: Google;
    }
}

export default Response;
