import {render} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import Composer from '@components/Composer';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
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
            <OnyxListItemProvider>
                <Composer value="# 😄" />
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdates();

        const props = (RNMarkdownTextInput as jest.MockedFunction<typeof RNMarkdownTextInput>).mock.calls.at(0)?.at(0);
        expect(props).toEqual(
            expect.objectContaining({
                markdownStyle: expect.objectContaining({
                    emoji: expect.objectContaining({
                        fontSize: variables.fontSizeOnlyEmojis,
                    }),
                }),
            }),
        );
    });
});
