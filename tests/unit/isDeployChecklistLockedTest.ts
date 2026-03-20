/**
 * @jest-environment node
 */
import * as core from '@actions/core';
import run from '../../.github/actions/javascript/isDeployChecklistLocked/isDeployChecklistLocked';
import * as DeployChecklistUtils from '../../.github/libs/DeployChecklistUtils';

jest.mock('../../.github/libs/DeployChecklistUtils');

beforeAll(() => {
    process.env.INPUT_GITHUB_TOKEN = 'fake_token';
});

beforeEach(() => {
    jest.resetModules();
});

afterAll(() => {
    delete process.env.INPUT_GITHUB_TOKEN;
});

describe('isDeployChecklistLockedTest', () => {
    describe('GitHub action run function', () => {
        test('Test returning empty result', () => {
            (DeployChecklistUtils.getDeployChecklist as jest.Mock).mockResolvedValue({});
            const setOutputMock = jest.spyOn(core, 'setOutput');
            const isDeployChecklistLocked = run();
            return isDeployChecklistLocked.then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', false);
            });
        });

        test('Test returning valid locked issue', () => {
            const mockData = {
                labels: [{name: '🔐 LockCashDeploys 🔐'}],
            };

            (DeployChecklistUtils.getDeployChecklist as jest.Mock).mockResolvedValue(mockData);
            const setOutputMock = jest.spyOn(core, 'setOutput');
            const isDeployChecklistLocked = run();
            return isDeployChecklistLocked.then(() => {
                expect(setOutputMock).toHaveBeenCalledWith('IS_LOCKED', true);
            });
        });
    });
});
