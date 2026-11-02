declare global {
    type TurnstileRenderOptions = {
        sitekey: string;
        callback: (token: string) => void;
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Cloudflare uses these names
        'error-callback': (errorCode: string) => void;
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Cloudflare uses these names
        'expired-callback': () => void;
    };

    type TurnstileApi = {
        render: (element: HTMLElement, options: TurnstileRenderOptions) => string;
        remove: (widgetId: string) => void;
    };

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- merging into the global Window interface requires an interface, a type alias cannot participate in declaration merging
    interface Window {
        turnstile?: TurnstileApi;
    }
}

export {};
