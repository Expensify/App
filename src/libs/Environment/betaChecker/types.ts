type IsBetaBuild = Promise<boolean>;

type EnvironmentCheckerModule = {
    isBeta: () => IsBetaBuild;
};

export type {IsBetaBuild, EnvironmentCheckerModule};
