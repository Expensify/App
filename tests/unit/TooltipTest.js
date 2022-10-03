import React from 'react';
import {screen, render, fireEvent} from '@testing-library/react';
import ContextMenuItem from '../../src/components/ContextMenuItem';

const Localize = require('../../src/libs/Localize');

test('Show text in tooltip', () => {
    render(<ContextMenuItem
        icon=""
        text={Localize.translate('en', 'reportActionContextMenu.copyToClipboard')}
        successIcon=""
        successText={Localize.translate('en', 'reportActionContextMenu.copyToClipboard')}
        onPress={() => { }}
    />);
    const element = screen.getByText(Localize.translate('en', 'reportActionContextMenu.copyToClipboard'));
    fireEvent.mouseOver(element);

    screen.findByText(Localize.translate('en', 'reportActionContextMenu.copyToClipboard')).then((result) => {
        expect(
            result,
        ).toBe(element);
    });
});
