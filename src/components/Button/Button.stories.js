import React from 'react';
import {storiesOf} from '@storybook/react';
import Button from './Button';

storiesOf('Button', module)
    .add('Button (Normal)', () => (
        <Button text="Go" />
    ))
    .add('Button (Small)', () => (
        <Button
            text="Go"
            small
        />
    ))
    .add('Button (Loading)', () => (
        <Button
            text="Go"
            isLoading
        />
    ))
    .add('Button (Loading, Small)', () => (
        <Button
            text="Go"
            small
            isLoading
        />
    ));
