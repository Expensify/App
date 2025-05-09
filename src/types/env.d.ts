declare namespace NodeJS {
    type ProcessEnv = {
        GITHUB_REPOSITORY_OWNER: string;
        GITHUB_REPOSITORY: string | undefined;
        GITHUB_TOKEN: string | undefined;
        PORT: number | undefined;
        WORKING_DIRECTORY: string | undefined;
    };
}
