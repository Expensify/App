import {render} from '@testing-library/react-native';

import Badge from '@components/Badge';

import CONST from '@src/CONST';

import React from 'react';

type CapturedPressableProps = {
    role?: string;
    accessibilityLabel?: string;
};

/** The outermost host element of a render, without naming the deprecated react-test-renderer types. */
type RenderedElement = ReturnType<typeof render>['root'];

const capturedPressableProps: {current: CapturedPressableProps | null} = {current: null};

jest.mock('@components/Pressable/PressableWithoutFeedback', () => ({
    __esModule: true,
    default: (props: CapturedPressableProps) => {
        capturedPressableProps.current = props;
        return null;
    },
}));
jest.mock('@components/Icon', () => ({__esModule: true, default: () => null}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: jest.fn(() => new Proxy({}, {get: () => ({})}))}));
jest.mock('@hooks/useStyleUtils', () => ({__esModule: true, default: jest.fn(() => new Proxy({}, {get: () => () => ({})}))}));

/** Renders a badge and returns the element wrapping its icon. */
function renderIconContainer(element: React.ReactElement): RenderedElement {
    const iconContainer = render(element).root.children.at(0);
    if (!iconContainer || typeof iconContainer === 'string') {
        throw new Error('Expected the badge to render an icon container');
    }
    return iconContainer;
}

describe('Badge accessibility', () => {
    beforeEach(() => {
        capturedPressableProps.current = null;
    });

    it('does not put an accessible name on the presentational wrapper, so it collapses out of the accessibility tree', () => {
        const wrapper = render(<Badge text="Default" />).root;

        expect(wrapper.props.role).toBe(CONST.ROLE.PRESENTATION);
        expect(wrapper.props['aria-label']).toBeUndefined();
        expect(wrapper.props.accessibilityLabel).toBeUndefined();
    });

    it('hides the icon from assistive tech when the badge has text to name it', () => {
        const iconContainer = renderIconContainer(
            <Badge
                text="Done"
                icon={{}}
            />,
        );

        expect(iconContainer.props['aria-hidden']).toBe(true);
    });

    it('leaves an icon-only badge exposed, since it has no text to name it', () => {
        const iconContainer = renderIconContainer(
            <Badge
                text=""
                icon={{}}
            />,
        );

        expect(iconContainer.props['aria-hidden']).toBeUndefined();
    });

    it('keeps the accessible name on a pressable badge', () => {
        render(
            <Badge
                text="Upgrade"
                pressable
            />,
        );

        expect(capturedPressableProps.current?.role).toBe(CONST.ROLE.BUTTON);
        expect(capturedPressableProps.current?.accessibilityLabel).toBe('Upgrade');
    });
});
