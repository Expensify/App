import {render, screen} from '@testing-library/react-native';

import Container from '@components/Modal/ReanimatedModal/Container';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

describe('Native modal slide bounds', () => {
    it.each([64, 96])('includes a %i-point bottom anchor in the animated region', (bottom) => {
        render(
            <Container
                testID="positioning-root"
                type={CONST.MODAL.MODAL_TYPE.POPOVER}
                style={{position: 'absolute', left: 16, bottom}}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                onOpenCallBack={jest.fn()}
                onCloseCallBack={jest.fn()}
            >
                <View style={{height: 300}} />
            </Container>,
        );

        expect(screen.getByTestId('positioning-root')).toHaveStyle({bottom: 0, left: 16});
        const animatedFrame = screen.UNSAFE_getAllByType(View).find((element) => element.props.entering !== undefined);
        expect(animatedFrame?.props.style).toEqual(expect.arrayContaining([{paddingBottom: bottom}]));
    });

    it('does not move the anchor for fade-only menus', () => {
        render(
            <Container
                testID="positioning-root"
                type={CONST.MODAL.MODAL_TYPE.POPOVER}
                style={{position: 'absolute', bottom: 64}}
                animationIn="fadeIn"
                animationOut="fadeOut"
                onOpenCallBack={jest.fn()}
                onCloseCallBack={jest.fn()}
            >
                <View />
            </Container>,
        );

        expect(screen.getByTestId('positioning-root')).toHaveStyle({bottom: 64});
        const animatedFrame = screen.UNSAFE_getAllByType(View).find((element) => element.props.entering !== undefined);
        expect(animatedFrame?.props.style).not.toEqual(expect.arrayContaining([{paddingBottom: 64}]));
    });
});
