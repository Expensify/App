import ShareActionHandler from '@libs/ShareActionHandlerModule';

import {getShareActionHandlerNitroModule} from '@expensify/nitro-utils';

jest.mock('@expensify/nitro-utils', () => ({getShareActionHandlerNitroModule: jest.fn()}));

describe('ShareActionHandlerModule', () => {
    it('rejects instead of throwing when the native share handler cannot be created', async () => {
        // Given a native build where the ShareActionHandler hybrid object is not registered
        jest.mocked(getShareActionHandlerNitroModule).mockImplementation(() => {
            throw new Error('HybridObject "ShareActionHandler" has not been registered');
        });

        // When the Share screen asks for the shared files
        const result = ShareActionHandler.processFiles();

        // Then the failure arrives as a rejection, so the Share screen's catch handler can show the attachment error
        await expect(result).rejects.toThrow('has not been registered');
    });
});
