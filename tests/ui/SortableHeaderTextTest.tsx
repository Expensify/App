import {render, screen} from '@testing-library/react-native';

import SortableHeaderText from '@components/Search/SortableHeaderText';

import CONST from '@src/CONST';

const DEFAULT_PROPS = {
    text: 'Total',
    isActive: false,
    sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
    onPress: () => {},
};

describe('SortableHeaderText', () => {
    it('should name a sortable column after its text rather than after its role', () => {
        render(<SortableHeaderText {...DEFAULT_PROPS} />);

        expect(screen.getByLabelText('Total')).toBeOnTheScreen();
        expect(screen.queryByLabelText(CONST.ROLE.BUTTON)).not.toBeOnTheScreen();
    });

    it('should keep the sortable column pressable under its own name', () => {
        const onPress = jest.fn();
        render(
            <SortableHeaderText
                {...DEFAULT_PROPS}
                onPress={onPress}
            />,
        );

        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Total'})).toBeOnTheScreen();
    });
});
