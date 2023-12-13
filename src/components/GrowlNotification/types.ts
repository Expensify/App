import {ForwardedRef} from 'react';

type GrowlRef = {
    show?: (bodyText: string, type: string, duration: number) => void;
};

type GrowlNotificationProps = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _: unknown;

    ref: ForwardedRef<GrowlRef>;
};

export type {GrowlRef, GrowlNotificationProps};
