import React from 'react';
import {Pressable} from 'react-native';
import {screen, render, fireEvent} from '@testing-library/react';
import '../../__mocks__/match-media';
import Tooltip from '../../src/components/Tooltip';
import * as Expensicons from '../../src/components/Icon/Expensicons';
import Icon from '../../src/components/Icon';
import * as Localize from '../../src/libs/Localize';
import styles from '../../src/styles/styles';

describe('TooltipTest', () => {
    test('Show text in tooltip', () => {
        render(
            <Tooltip text={Localize.translate('en', 'common.close')}>
                <Pressable
                    onPress={() => {}}
                    style={[styles.touchableButtonImage, styles.mr0]}
                    data-testid="custom-element"
                >
                    <Icon src={Expensicons.Close} />
                </Pressable>
            </Tooltip>,
        );

        const tooltipText = screen.queryByText(Localize.translate('en', 'common.close'));
        expect(tooltipText).toBeNull();
        const iconElement = screen.getByTestId('custom-element');
        fireEvent.mouseOver(iconElement);
        screen.findByText(Localize.translate('en', 'common.close')).then((result) => {
            expect(
                result,
            ).toBe(tooltipText);
        });
    });

    test('Tooltip does not show on devices without a mouse', () => {
        render(
            <Tooltip text={Localize.translate('en', 'common.close')}>
                <Pressable
                    onPress={() => {}}
                    style={[styles.touchableButtonImage, styles.mr0]}
                    data-testid="custom-element"
                >
                    <Icon src={Expensicons.Close} />
                </Pressable>
            </Tooltip>,
        );
        let isMouseAttached = false;
        let isCursorAvailabe = matchMedia('(pointer:fine)', isMouseAttached).matches;
        expect(isCursorAvailabe).toBe(false);

        isMouseAttached = true;
        isCursorAvailabe = matchMedia('(pointer:fine)', isMouseAttached).matches;
        expect(isCursorAvailabe).toBe(true);
    });
});
