import {render, screen} from '@testing-library/react-native';
import React from 'react';
import HTMLEngineProvider from '@components/HTMLEngineProvider/index.native';
import RenderHTML from '@components/RenderHTML';

const renderHTML = (html: string) => {
    return render(
        <HTMLEngineProvider>
            <RenderHTML html={html} />
        </HTMLEngineProvider>,
    );
};

describe('HTMLRenderers', () => {
    // The testID prop is required by SelectionScraper to identify the original tag.
    // For example, <strong></strong> will be rendered as <span testID="strong"></span>.
    describe('has testID containing the original tag name', () => {
        it.each([['a'], ['em'], ['i'], ['strong'], ['b'], ['del'], ['s'], ['h1'], ['h2'], ['h3'], ['h4'], ['h5'], ['h6'], ['pre'], ['blockquote'], ['code']])('%s', (tag) => {
            // When the HTML is rendered with the specified tag and a sample text content inside it
            const text = 'test';
            renderHTML(`<${tag}>${text}</${tag}>`);

            // Then a testID should be assigned to the tag and contain the tag name
            const testIDElement = screen.queryByTestId(tag);
            expect(testIDElement).not.toBeNull();

            // Then the element should match the content
            // eslint-disable-next-line testing-library/no-node-access
            const textElement = testIDElement?.find((node) => typeof node.children.at(0) === 'string' && node.children.at(0) === text);
            expect(textElement).not.toBeNull();
        });
    });
});
