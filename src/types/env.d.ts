declare namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface ProcessEnv {
        GITHUB_REPOSITORY_OWNER: string;
        GITHUB_REPOSITORY: string;
        GITHUB_TOKEN: string | undefined;
        PORT: number | undefined;
        WORKING_DIRECTORY: string | undefined;
        OPENAI_API_KEY: string | undefined;
        LANGUAGES_DIR: string | undefined;
    }
}
