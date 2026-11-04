import {render, screen} from '@testing-library/react-native';

import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import type {ConfirmationFooterContentProps} from '@components/MoneyRequestConfirmationList/ConfirmationFooterContent';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import type {ConfirmationListLayoutProps} from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import Text from '@components/Text';

import CONST from '@src/CONST';

import type {ComponentType, ReactNode} from 'react';

import React, {useEffect} from 'react';

import createMock from '../../../utils/createMock';

type ReactNativeActual = {
    View: ComponentType<{testID?: string; children?: ReactNode}>;
};

const mockFooterContent = jest.fn();

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({}),
}));

jest.mock('@libs/telemetry/activeSpans', () => ({
    endSpan: jest.fn(),
}));

// The real list needs layout and keyboard plumbing. The layout only hands it the two footers, so render those directly.
jest.mock('@components/SelectionList/SelectionListWithSections', () => {
    const {View} = jest.requireActual<ReactNativeActual>('react-native');
    return {
        __esModule: true,
        default: ({footerContent, listFooterContent}: {footerContent?: ReactNode; listFooterContent?: ReactNode}) => (
            <View>
                {listFooterContent}
                {footerContent}
            </View>
        ),
    };
});

jest.mock('@components/MoneyRequestConfirmationList/ConfirmationFooterContent', () => {
    const {View} = jest.requireActual<ReactNativeActual>('react-native');
    return {
        __esModule: true,
        default: (props: unknown) => {
            mockFooterContent(props);
            return <View testID="confirmation-footer-content" />;
        },
    };
});

const footerContentProps = createMock<ConfirmationFooterContentProps>({iouType: CONST.IOU.TYPE.SUBMIT});

function renderLayout(overrides: Partial<ConfirmationListLayoutProps> = {}) {
    return render(
        <ConfirmationListLayout
            transactionID="txn1"
            sections={[]}
            listRef={{current: null}}
            isReadOnly={false}
            listFooterContent={null}
            confirmationFieldsProviderProps={{transactionID: 'txn1', reportID: 'report1', action: CONST.IOU.ACTION.CREATE, iouType: CONST.IOU.TYPE.SUBMIT}}
            onSelectRow={() => {}}
            onDismissError={() => {}}
            footerContentProps={footerContentProps}
            {...overrides}
        />,
    );
}

describe('ConfirmationListLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('mounts the controllers before the footer fields and gives the fields the provider values', () => {
        // Given a controller and a footer field that record when their mount effects run
        const mountOrder: string[] = [];
        function Controller() {
            useEffect(() => {
                mountOrder.push('controller');
            }, []);
            return null;
        }
        function FooterField() {
            const {transactionID, isScanRequest} = useConfirmationFields();
            useEffect(() => {
                mountOrder.push('field');
            }, []);
            return <Text>{`${transactionID}:${String(isScanRequest)}`}</Text>;
        }

        // When the layout renders them, with a scan flag set by the variant
        renderLayout({
            listFooterContent: <FooterField />,
            fieldFlags: {isScanRequest: true},
            children: <Controller />,
        });

        // Then the controller's effect runs first, because controllers seed values the fields read on mount
        expect(mountOrder).toEqual(['controller', 'field']);

        // And the field reads the shared provider props and the variant's flag from the fields context
        expect(screen.getByText('txn1:true')).toBeTruthy();
    });

    it('does not render the confirm button block when read-only', () => {
        // Given a read-only confirmation, such as split details the user can't edit
        // When the layout renders
        renderLayout({isReadOnly: true});

        // Then the confirm button block is not rendered, so the list gets no footer
        expect(screen.queryByTestId('confirmation-footer-content')).toBeNull();
        expect(mockFooterContent).not.toHaveBeenCalled();
    });

    it('renders the confirm button block with the given props when editable', () => {
        // Given an editable confirmation
        // When the layout renders
        renderLayout();

        // Then the confirm button block is rendered with the props the hook built for it
        expect(screen.getByTestId('confirmation-footer-content')).toBeTruthy();
        expect(mockFooterContent).toHaveBeenCalledWith(footerContentProps);
    });
});
