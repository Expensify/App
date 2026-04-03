import {render, screen} from '@testing-library/react-native';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

jest.mock('@libs/Log');
jest.mock('@expensify/react-native-hybrid-app', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        isHybridApp: () => false,
    },
}));

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(() => true),
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
    })),
);

describe('Selection checkbox focus contract', () => {
    function getInteractiveCheckbox() {
        const checkboxes = screen.getAllByRole(CONST.ROLE.CHECKBOX);
        return checkboxes.find((checkbox) => checkbox.props.onKeyDown);
    }

    it('renders the single-select indicator as a non-tabstop descendant when opt-in tabIndex is supplied', () => {
        render(
            <OnyxListItemProvider>
                <SingleSelectListItem
                    item={{text: 'Advertising', keyForList: 'advertising', isSelected: true}}
                    keyForList="advertising"
                    isFocused
                    showTooltip={false}
                    isDisabled={false}
                    onSelectRow={() => {}}
                />
            </OnyxListItemProvider>,
        );

        const checkbox = getInteractiveCheckbox();
        expect(checkbox?.props.tabIndex).toBe(-1);
    });

    it('keeps the multi-select indicator on the shared default tabIndex contract', () => {
        render(
            <OnyxListItemProvider>
                <MultiSelectListItem
                    item={{text: 'Room A', keyForList: 'room-a', isSelected: true}}
                    keyForList="room-a"
                    isFocused
                    showTooltip={false}
                    isDisabled={false}
                    onSelectRow={() => {}}
                />
            </OnyxListItemProvider>,
        );

        const checkbox = getInteractiveCheckbox();
        expect(checkbox?.props.tabIndex).toBeUndefined();
    });
});
