import {render} from '@testing-library/react-native';

import Backdrop from '@components/Modal/ReanimatedModal/Backdrop/index.web';

import React from 'react';
import Animated from 'react-native-reanimated';

describe('ReanimatedModal web Backdrop', () => {
    it.each([
        ['default backdrop', undefined],
        ['custom backdrop', <Animated.View key="custom" />],
    ])('renders the %s without an entering keyframe', (_, customBackdrop) => {
        // Given a visible modal backdrop on web
        const {UNSAFE_root: root} = render(
            <Backdrop
                style={undefined}
                isBackdropVisible
                customBackdrop={customBackdrop}
                onBackdropPress={jest.fn()}
            />,
        );

        // When we look for an entering animation on any rendered element
        const elementsWithEntering = root.findAll((node) => node.props.entering !== undefined);

        // Then there is none, because on web Reanimated hides the element until the keyframe starts and can delete the keyframe
        // before the next animation frame (for example in a background tab), which would leave the backdrop hidden for good
        expect(elementsWithEntering).toHaveLength(0);
    });
});
