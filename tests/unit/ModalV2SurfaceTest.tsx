/**
 * @jest-environment jsdom
 */
import {render} from '@testing-library/react-native';
import React from 'react';
import type {ReactNode} from 'react';
import Surface from '@components/Modal/v2/compound/Surface';
import Text from '@components/Text';
import CONST from '@src/CONST';

type AnimatedSurfacePropsCapture = {
    role?: 'dialog' | 'alertdialog';
    // eslint-disable-next-line @typescript-eslint/naming-convention -- WAI-ARIA attribute name.
    'aria-modal'?: boolean;
    accessibilityLabelledBy?: string;
    accessibilityDescribedBy?: string;
    nativeID?: string;
};

const animatedSurfacePropsCapture: {current: AnimatedSurfacePropsCapture[]} = {current: []};

jest.mock('@components/Overlay/AnimatedSurface', () => {
    function MockAnimatedSurface({children, ...props}: {children?: ReactNode} & AnimatedSurfacePropsCapture) {
        animatedSurfacePropsCapture.current.push({
            role: props.role,
            // eslint-disable-next-line @typescript-eslint/naming-convention -- WAI-ARIA attribute name.
            'aria-modal': props['aria-modal'],
            accessibilityLabelledBy: props.accessibilityLabelledBy,
            accessibilityDescribedBy: props.accessibilityDescribedBy,
            nativeID: props.nativeID,
        });
        return children ?? null;
    }
    return MockAnimatedSurface;
});

jest.mock('@hooks/useThemeStyles', () => () => ({
    modalAnimatedContainer: {width: '100%'},
}));

beforeEach(() => {
    animatedSurfacePropsCapture.current = [];
});

describe('Modal/v2/Surface', () => {
    describe('aria-modal contract — modal Surface always declares the modal boundary regardless of role', () => {
        it("emits aria-modal=true when role='dialog'", () => {
            render(
                <Surface
                    role={CONST.ROLE.DIALOG}
                    animationIn="fadeIn"
                    animationOut="fadeOut"
                    animationInTiming={100}
                    animationOutTiming={100}
                >
                    <Text>Body</Text>
                </Surface>,
            );
            const captured = animatedSurfacePropsCapture.current.at(-1);
            expect(captured?.['aria-modal']).toBe(true);
            expect(captured?.role).toBe('dialog');
        });

        it("emits aria-modal=true when role='alertdialog'", () => {
            render(
                <Surface
                    role={CONST.ROLE.ALERTDIALOG}
                    animationIn="fadeIn"
                    animationOut="fadeOut"
                    animationInTiming={100}
                    animationOutTiming={100}
                >
                    <Text>Body</Text>
                </Surface>,
            );
            const captured = animatedSurfacePropsCapture.current.at(-1);
            expect(captured?.['aria-modal']).toBe(true);
            expect(captured?.role).toBe('alertdialog');
        });
    });

    describe('ARIA wiring', () => {
        it('forwards labelledBy/describedBy/nativeID to AnimatedSurface as the WAI-ARIA dialog bag', () => {
            render(
                <Surface
                    role={CONST.ROLE.DIALOG}
                    labelledBy="title-id"
                    describedBy="desc-id"
                    nativeID="content-id"
                    animationIn="fadeIn"
                    animationOut="fadeOut"
                    animationInTiming={100}
                    animationOutTiming={100}
                >
                    <Text>Body</Text>
                </Surface>,
            );
            const captured = animatedSurfacePropsCapture.current.at(-1);
            expect(captured?.accessibilityLabelledBy).toBe('title-id');
            expect(captured?.accessibilityDescribedBy).toBe('desc-id');
            expect(captured?.nativeID).toBe('content-id');
        });
    });
});
