import React from "react";
import { screen, render, fireEvent } from "@testing-library/react";
import ContextMenuItem from "../../src/components/ContextMenuItem";
const Localize = require('../../src/libs/Localize');

test("Show title in tooltip", async () => {
    render(<ContextMenuItem
        icon={''}
        text={Localize.translate('en', 'reportActionContextMenu.copyToClipboard')}
        successIcon={''}
        successText={Localize.translate('en', 'reportActionContextMenu.copyToClipboard')}
        onPress={() => { }}
    />);
    const element = screen.getByText(Localize.translate('en', 'reportActionContextMenu.copyToClipboard'))
    fireEvent.mouseOver(element);

    expect(
        await screen.findByText(Localize.translate('en', 'reportActionContextMenu.copyToClipboard'))
    ).toBe(element);
});
