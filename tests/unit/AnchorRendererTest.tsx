import {render} from '@testing-library/react-native';

import AnchorPressOverrideContext from '@components/HTMLEngineProvider/HTMLRenderers/AnchorPressOverrideContext';
import AnchorRenderer from '@components/HTMLEngineProvider/HTMLRenderers/AnchorRenderer';
import {isChildOfComment} from '@components/HTMLEngineProvider/htmlEngineUtils';

import {openLink} from '@libs/actions/Link';

import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';

import React from 'react';

import createMock from '../utils/createMock';

type MockAnchorProps = {onPress: () => void};
const mockCommentAnchor = jest.fn<null, [MockAnchorProps]>(() => null);
const mockTextLink = jest.fn<null, [MockAnchorProps]>(() => null);

jest.mock('@components/AnchorForCommentsOnly', () => ({__esModule: true, default: (props: MockAnchorProps) => mockCommentAnchor(props)}));
jest.mock('@components/TextLink', () => ({__esModule: true, default: (props: MockAnchorProps) => mockTextLink(props)}));
jest.mock('@components/OnyxListItemProvider', () => ({useSession: () => undefined}));
jest.mock('@hooks/useEnvironment', () => () => ({environmentURL: 'https://dev.new.expensify.com:8082/'}));
jest.mock('@hooks/useHover', () => () => ({hovered: false, bind: {}}));
jest.mock('@components/HTMLEngineProvider/htmlEngineUtils', () => ({
    isChildOfComment: jest.fn(),
    isChildOfTaskTitle: () => false,
    isDeletedNode: () => false,
    isChildOfRBR: () => false,
    isChildOfLabelText: () => false,
    isChildOfMutedTextLabel: () => false,
    isChildOfMutedTextXS: () => false,
    isChildOfMutedTextMicro: () => false,
    isChildOfAlertText: () => false,
}));
jest.mock('@libs/actions/Link', () => ({
    getInternalNewExpensifyPath: () => 'settings/preferences/home-address',
    getInternalExpensifyPath: () => '',
    openLink: jest.fn(),
}));

const href = 'https://new.expensify.com/settings/preferences/home-address';
const rendererProps = createMock<CustomRendererProps<TPhrasing | TText>>({
    tnode: {attributes: {href}, tagName: 'a', children: [], classes: [], parent: null},
});

describe('AnchorRenderer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([true, false])('prefers a scoped press override (comment: %s)', (isComment) => {
        // Given a scoped override for this anchor in either renderer branch
        jest.mocked(isChildOfComment).mockReturnValue(isComment);
        const pressOverride = jest.fn();
        const getOverride = jest.fn(() => pressOverride);
        render(
            <AnchorPressOverrideContext.Provider value={getOverride}>
                <AnchorRenderer {...rendererProps} />
            </AnchorPressOverrideContext.Provider>,
        );

        // When the rendered link is pressed
        const anchor = isComment ? mockCommentAnchor : mockTextLink;
        const props = anchor.mock.calls.at(0)?.[0];
        props?.onPress();

        // Then only the message-specific navigation runs, preserving the shared anchor itself
        expect(getOverride).toHaveBeenCalledWith(href);
        expect(pressOverride).toHaveBeenCalledTimes(1);
        expect(openLink).not.toHaveBeenCalled();
    });

    it.each([true, false])('keeps default handling without an override (comment: %s)', (isComment) => {
        // Given an ordinary internal anchor with no surrounding override provider
        jest.mocked(isChildOfComment).mockReturnValue(isComment);
        render(<AnchorRenderer {...rendererProps} />);

        // When the rendered link is pressed
        const anchor = isComment ? mockCommentAnchor : mockTextLink;
        const props = anchor.mock.calls.at(0)?.[0];
        props?.onPress();

        // Then existing links still use the standard link action
        expect(openLink).toHaveBeenCalledWith(href, 'https://dev.new.expensify.com:8082/', false, undefined);
    });
});
