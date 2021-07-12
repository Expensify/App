const childProcess = require('child_process');
const GitUtils = require('../../.github/libs/GitUtils');

jest.mock('child_process');
const {execSync} = childProcess;

const data = [
    {
        gitLog: `Start adding StagingDeployCash logic
        Setting up bones
        Merge pull request #337 from Expensify/francoisUpdateQbdSyncManager
        Merge pull request #336 from Expensify/andrew-pr-cla
        Update QBD Sync Manager version
        Only run CLA on PR comments or events
        Merge pull request #331 from Expensify/marcaaron-killMoment
        Merge pull request #330 from Expensify/andrew-cla-update
        Merge pull request #333 from Expensify/Rory-AddOnOffSwitchTooltip
        Setup OnOffSwitch component with tooltips
        Merge pull request #332 from Expensify/alex-mechler-patch-1
        Return to old hash-based deploy instrcutions
        Remove DEFAULT_START_DATE & DEFAULT_END_DATE altogether`,
        result: ['337', '336', '331', '330', '333', '332'],
    },
    {
        gitLog: `Merge pull request #1521 from parasharrajat/parasharrajat/pdf-render
        Merge pull request #1563 from Expensify/version-bump-e6498075e301df3e9c8d7866ea391a23c19ed9b0
        Update version to 1.0.1-470
        Merge pull request #1557 from aliabbasmalik8/IS-1500-compose-field-alignment-issue
        Merge pull request #1562 from Expensify/version-bump-b9c85aa97dfb656b01a83871b4bbaed5e287c8b7
        Update version to 1.0.1-469
        Merge pull request #1515 from anthony-hull/typos
        [IS-1500] Updated textalignInput utility
        Merge pull request #1560 from Expensify/version-bump-b742a55d18e761cd7adb0849a29cfb48b3a04f99
        Update version to 1.0.1-468
        Merge pull request #1555 from SameeraMadushan/sameera-IsAppInstalledLogic
        Merge pull request #1 from Expensify/master
        Merge pull request #2 from Expensify/main
        fix: set pdf width on large screens
        [IS-1500] Fixed compose field alignment issue`,
        result: ['1521', '1557', '1515', '1555'],
    },
    {
        gitLog: `Return to old hash-based deploy instrcutions
        Remove DEFAULT_START_DATE & DEFAULT_END_DATE altogether
        refactor`,
        result: [],
    },
];

describe('GitUtils', () => {
    describe.each(data)('getPullRequestsMergedBetween', (exampleCase) => {
        test('getPullRequestsMergedBetween', () => {
            execSync.mockReturnValueOnce(exampleCase.gitLog);
            const result = GitUtils.getPullRequestsMergedBetween('testRef1', 'testRef2');
            expect(result).toStrictEqual(exampleCase.result);
        });
    });
});
