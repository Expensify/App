import {render} from '@testing-library/react-native';

import BlockingView from '@components/BlockingViews/BlockingView';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import type ScrollView from '@components/ScrollView';
import type Text from '@components/Text';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/BlockingViews/BlockingView', () => jest.fn(() => null));
jest.mock('@components/ScrollView', () => jest.requireActual<{ScrollView: typeof ScrollView}>('react-native').ScrollView);
jest.mock('@components/Text', () => jest.requireActual<{Text: typeof Text}>('react-native').Text);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => new Proxy({}, {get: () => ({})}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyIllustrations: () => ({ToddWithPhones: 'phones'})}));
describe('EmptySelectionListContent', () => {
    beforeEach(() => jest.mocked(BlockingView).mockClear());
    it.each([CONST.IOU.TYPE.CREATE, CONST.IOU.TYPE.SUBMIT])('uses CREATE copy for admitted type %s', (contentType) => {
        // Given a type admitted by the finite selection gate
        // When the real content component renders
        render(<EmptySelectionListContent contentType={contentType} />);
        // Then both admitted routes keep the established CREATE copy
        expect(jest.mocked(BlockingView).mock.lastCall?.[0]).toMatchObject({
            title: 'emptyList.create.title',
            icon: 'phones',
        });
    });
    it('rejects unrelated and malformed values before rendering content', () => {
        // Given a valid but unrelated string and a malformed null-like runtime value
        // When each value reaches the real gate
        const unrelated = render(<EmptySelectionListContent contentType="unrelated" />);
        const malformed = render(
            // @ts-expect-error: This precise malformed value models a stale runtime caller.
            <EmptySelectionListContent contentType={null} />,
        );
        // Then neither value creates an empty-list illustration
        expect(unrelated.toJSON()).toBeNull();
        expect(malformed.toJSON()).toBeNull();
        expect(BlockingView).not.toHaveBeenCalled();
    });
});
