import {render} from '@testing-library/react-native';

import FormHelpMessage from '@components/FormHelpMessage';

import React from 'react';

const mockRenderHTML = jest.fn<null, [{html: string}]>(() => null);

jest.mock('@components/RenderHTML', () => (props: {html: string}) => mockRenderHTML(props));

jest.mock('@hooks/useAccessibilityAnnouncement', () => ({
    __esModule: true,
    default: jest.fn(),
}));

function getRenderedHTML(): string {
    return mockRenderHTML.mock.lastCall?.[0].html ?? '';
}

describe('FormHelpMessage', () => {
    beforeEach(() => {
        mockRenderHTML.mockClear();
    });

    it('does not parse an HTML message a second time, so a user mention is wrapped exactly once', () => {
        render(
            <FormHelpMessage
                message="<mention-user>@john@example.com</mention-user>"
                isError={false}
                shouldRenderMessageAsHTML
            />,
        );

        const html = getRenderedHTML();
        expect(html).toBe('<muted-text-label><mention-user>@john@example.com</mention-user></muted-text-label>');
        expect(html.match(/<mention-user>/g)).toHaveLength(1);
    });

    it('still converts a markdown message to HTML', () => {
        render(
            <FormHelpMessage
                message="[Go to Expensify Classic to fix this issue.](https://www.expensify.com)"
                shouldRenderMessageAsHTML
                isError
            />,
        );

        const html = getRenderedHTML();
        expect(html).toContain('<alert-text>');
        expect(html).toContain('<a href="https://www.expensify.com"');
    });
});
