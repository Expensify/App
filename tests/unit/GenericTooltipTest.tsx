import {render} from '@testing-library/react-native';

import GenericTooltip from '@components/Tooltip/GenericTooltip';

import React, {useEffect} from 'react';
import {View} from 'react-native';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        preferredLocale: 'en',
        translate: (key: string) => key,
    })),
);

function MountCounter({onMount}: {onMount: () => void}) {
    useEffect(() => {
        onMount();
    }, [onMount]);
    return <View />;
}

describe('GenericTooltip', () => {
    it('does not remount its children when the text toggles between empty and non-empty', () => {
        // Given a tooltip with no text, wrapping a child that counts its mounts. Callers such as a text input toggle `text`
        // to turn the tooltip on and off, and a remount would drop the input's focus.
        const onMount = jest.fn();
        const renderTooltip = (text: string) => <GenericTooltip text={text}>{() => <MountCounter onMount={onMount} />}</GenericTooltip>;
        const {rerender} = render(renderTooltip(''));

        // When the text is set and then cleared again
        rerender(renderTooltip('Full report field name'));
        rerender(renderTooltip(''));

        // Then the child is only mounted once
        expect(onMount).toHaveBeenCalledTimes(1);
    });
});
