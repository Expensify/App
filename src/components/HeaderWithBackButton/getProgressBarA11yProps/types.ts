type ProgressBarA11yProps = {
    accessible?: boolean;
    accessibilityLabel?: string;
};

type GetProgressBarA11yProps = (label?: string) => ProgressBarA11yProps;

export type {ProgressBarA11yProps, GetProgressBarA11yProps};
