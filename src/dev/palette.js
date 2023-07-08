import React, {Fragment} from 'react';
import {
    Category,
    Component,
    Variant,
    Palette,
} from '@react-buddy/ide-toolbox';

const PaletteTree = () => (
    <Palette>
        <Category name="App">
            <Component name="Loader">
                <Variant>
                    <ExampleLoaderComponent />
                </Variant>
            </Component>
        </Category>
    </Palette>
);

function ExampleLoaderComponent() {
    return (
        <>Loading...</>
    );
}

export {ExampleLoaderComponent, PaletteTree};
