// storybook/use-storybook-expect: expect comes from storybook's own test package
// storybook/use-storybook-testing-library: so do the queries
// storybook/await-interactions: an interaction returns a promise and must be awaited
// storybook/context-in-play-function: play() of another story needs the context passed on
import {expect} from '@jest/globals';
import {userEvent, within} from '@testing-library/react';

export default {title: 'Components/Play'};

export const First = {
    play: async ({canvasElement}) => {
        const canvas = within(canvasElement);
        userEvent.click(canvas.getByRole('button'));
        expect(true).toBe(true);
    },
};

export const Second = {
    play: async () => {
        await First.play();
    },
};
