import {render} from '@testing-library/react-native';

import DecisionModal from '@components/DecisionModal';
import type BaseModalProps from '@components/Modal/types';

import CONST from '@src/CONST';

let mockModalProps: BaseModalProps | undefined;

jest.mock('@components/Modal', () => {
    return (props: BaseModalProps) => {
        mockModalProps = props;
        return null;
    };
});

jest.mock('@hooks/useThemeStyles', () => () => ({
    pv0: {},
    p5: {},
    flexRow: {},
    mb5: {},
    alignItemsCenter: {},
    mt5: {},
    mt3: {},
    noSelect: {},
}));

describe('DecisionModal', () => {
    it.each([
        [true, CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED],
        [false, CONST.MODAL.MODAL_TYPE.CONFIRM],
    ])('stays semantically covering when small-screen width is %s', (isSmallScreenWidth, type) => {
        render(
            <DecisionModal
                title="Choose an option"
                secondOptionText="Continue"
                onSecondOptionSubmit={jest.fn()}
                isSmallScreenWidth={isSmallScreenWidth}
                onClose={jest.fn()}
                isVisible
            />,
        );

        expect(mockModalProps).toEqual(
            expect.objectContaining({
                isVisible: true,
                shouldTreatModalAsCovering: true,
                type,
            }),
        );
    });
});
