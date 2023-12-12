type GrowlRef = {
    show?: (bodyText: string, type: string, duration: number) => void;
};

type GrowlNotificationProps = {
    ref: React.RefObject<GrowlRef>;
};

export type {GrowlRef, GrowlNotificationProps};
