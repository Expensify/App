import React from 'react';
import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox';
import * as PaletteTree from './palette.js';
import Composer from '../components/Composer';
import App from '../App';

const ComponentPreviews = () => (
    <Previews palette={<PaletteTree />}>
        <ComponentPreview path="/Composer">
            <Composer />
        </ComponentPreview>
        <ComponentPreview path="/App">
            <App/>
        </ComponentPreview>
    </Previews>
);

export default ComponentPreviews;
