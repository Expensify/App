// storybook/no-renderer-packages: import the framework package, not the renderer
import type {Meta} from '@storybook/react';

const meta: Meta = {title: 'Components/Renderer'};

export default meta;

const Primary = {};

export {Primary};
