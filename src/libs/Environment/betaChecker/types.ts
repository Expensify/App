type IsBetaBuild = Promise<boolean>;

type EnvironmentCheckerProps = {
    isBeta: () => IsBetaBuild;
};

export type {IsBetaBuild, EnvironmentCheckerProps};
