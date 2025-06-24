import {render} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import Composer from '@components/Composer';
import OnyxProvider from '@components/OnyxProvider';
import RNMarkdownTextInput from '@components/RNMarkdownTextInput';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@components/RNMarkdownTextInput', () => {
    return jest.fn().mockImplementation(() => null);
});

describe('Composer', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('should show large emoji size if only has header markdown + emoji', async () => {
        render(
            <OnyxProvider>
                <Composer value="# 😄" />
            </OnyxProvider>,
        );

        await waitForBatchedUpdates();

        expect(RNMarkdownTextInput).toHaveBeenCalledWith(
            expect.objectContaining({
                markdownStyle: expect.objectContaining({
                    emoji: expect.objectContaining({
                        fontSize: variables.fontSizeOnlyEmojis,
                    }),
                }),
            }),
            expect.anything(),
        );
    });
});
