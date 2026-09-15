// storybook/await-interactions: every interaction helper returns a promise
import {userEvent, within} from '@storybook/test';

export default {title: 'Components/Await'};

export const Interaction = {
    play: async ({canvasElement}) => {
        const canvas = within(canvasElement);
        userEvent.click(canvas.getByRole('button'));
    },
};
