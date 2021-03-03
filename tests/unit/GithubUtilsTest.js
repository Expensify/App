const GithubUtils = require('../../.github/libs/GithubUtils');

const REPO_SLUG = 'test-owner/test-repo';

const MOCK_TAGS = [
    {name: '2.2.2'},
    {name: '2.2.1'},
    {name: '2.1.0-1'},
    {name: '2.1.0'},
    {name: '2.0.0-1'},
    {name: '2.0.0'},
    {name: '1.2.2-2'},
    {name: '1.2.2-1'},
    {name: '1.2.2'},
    {name: '1.2.1'},
    {name: '1.2.0'},
    {name: '1.1.0'},
    {name: '1.0.4'},
    {name: '1.0.3'},
    {name: '1.0.2'},
    {name: '1.0.1'},
    {name: '1.0.0'},
    {name: '0.0.1'},
];

const mockGithub = jest.fn(() => ({
    getOctokit: () => ({
        repos: {
            listTags: jest.fn(() => Promise.resolve({data: MOCK_TAGS})),
        },
    }),
}));

describe('GithubUtils', () => {
    const octokit = mockGithub().getOctokit();
    const githubUtils = new GithubUtils(octokit);

    describe('generateVersionComparisonURL', () => {
        describe('MAJOR comparison', () => {
            it('should return a comparison url between 2.2.2 and 1.2.2', async () => {
                const result = await githubUtils
                    .generateVersionComparisonURL(REPO_SLUG, '2.2.2', 'MAJOR');

                expect(result).toBe('https://github.com/Expensify/Expensify.cash/compare/1.2.2...2.2.2');
            });

            it('should return a comparison url between 1.2.0 and 0.0.1', async () => {
                const result = await githubUtils
                    .generateVersionComparisonURL(REPO_SLUG, '1.2.0', 'MAJOR');

                expect(result).toBe('https://github.com/Expensify/Expensify.cash/compare/0.0.1...1.2.0');
            });
        });

        describe('MINOR comparison', () => {
            it('should return a comparison url between 2.2.2 and 2.1.0', async () => {
                const result = await githubUtils
                    .generateVersionComparisonURL(REPO_SLUG, '2.2.2', 'MINOR');

                expect(result).toBe('https://github.com/Expensify/Expensify.cash/compare/2.1.0...2.2.2');
            });

            it('should return a comparison url between 1.1.0 and 1.0.4', async () => {
                const result = await githubUtils
                    .generateVersionComparisonURL(REPO_SLUG, '1.1.0', 'MINOR');

                expect(result).toBe('https://github.com/Expensify/Expensify.cash/compare/1.0.4...1.1.0');
            });
        });

        describe('PATCH comparison', () => {
            it('should return a comparison url between 2.2.2 and 2.2.1', async () => {
                const result = await githubUtils
                    .generateVersionComparisonURL(REPO_SLUG, '2.2.2', 'PATCH');

                expect(result).toBe('https://github.com/Expensify/Expensify.cash/compare/2.2.1...2.2.2');
            });

            it('should return a comparison url between 1.0.0 and 0.0.1', async () => {
                const result = await githubUtils
                    .generateVersionComparisonURL(REPO_SLUG, '1.0.0', 'PATCH');

                expect(result).toBe('https://github.com/Expensify/Expensify.cash/compare/0.0.1...1.0.0');
            });
        });

        describe('BUILD comparison', () => {
            it('should return a comparison url between 2.1.0-1 and 2.1.0', async () => {
                const result = await githubUtils
                    .generateVersionComparisonURL(REPO_SLUG, '2.1.0-1', 'BUILD');

                expect(result).toBe('https://github.com/Expensify/Expensify.cash/compare/2.1.0...2.1.0-1');
            });

            it('should return a comparison url between 1.2.2-2 and 1.2.2', async () => {
                const result = await githubUtils
                    .generateVersionComparisonURL(REPO_SLUG, '1.2.2-2', 'BUILD');

                expect(result).toBe('https://github.com/Expensify/Expensify.cash/compare/1.2.2...1.2.2-2');
            });
        });
    });
});
