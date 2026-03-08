import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import SelectionList from '@components/SelectionList';
import {ConstantPicker} from '@pages/Debug/ConstantPicker';
import CONST from '@src/CONST';
import REPORT_FORM_INPUT_IDS from '@src/types/form/DebugReportForm';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/RadioListItem', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

describe('ConstantPicker', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the selected constant to the top on reopen when the list is above threshold', () => {
        render(
            <ConstantPicker
                formType={CONST.DEBUG.FORMS.REPORT}
                fieldName={REPORT_FORM_INPUT_IDS.CHAT_TYPE}
                fieldValue={CONST.REPORT.CHAT_TYPE.GROUP}
                onSubmit={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                text: CONST.REPORT.CHAT_TYPE.GROUP,
                value: CONST.REPORT.CHAT_TYPE.GROUP,
                isSelected: true,
            }),
        );
    });

    it('keeps the originally pinned constant at the top while the selected value changes during the same mount', () => {
        const {rerender} = render(
            <ConstantPicker
                formType={CONST.DEBUG.FORMS.REPORT}
                fieldName={REPORT_FORM_INPUT_IDS.CHAT_TYPE}
                fieldValue={CONST.REPORT.CHAT_TYPE.GROUP}
                onSubmit={jest.fn()}
            />,
        );

        rerender(
            <ConstantPicker
                formType={CONST.DEBUG.FORMS.REPORT}
                fieldName={REPORT_FORM_INPUT_IDS.CHAT_TYPE}
                fieldValue={CONST.REPORT.CHAT_TYPE.SELF_DM}
                onSubmit={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                text: CONST.REPORT.CHAT_TYPE.GROUP,
                isSelected: false,
            }),
        );
        expect(selectionListProps?.data.find((item) => item.text === CONST.REPORT.CHAT_TYPE.SELF_DM)).toEqual(
            expect.objectContaining({
                text: CONST.REPORT.CHAT_TYPE.SELF_DM,
                isSelected: true,
            }),
        );
    });

    it('refreshes the pinned constant when reopened with a different saved value', () => {
        const {unmount} = render(
            <ConstantPicker
                formType={CONST.DEBUG.FORMS.REPORT}
                fieldName={REPORT_FORM_INPUT_IDS.CHAT_TYPE}
                fieldValue={CONST.REPORT.CHAT_TYPE.GROUP}
                onSubmit={jest.fn()}
            />,
        );
        unmount();
        mockedSelectionList.mockClear();

        render(
            <ConstantPicker
                formType={CONST.DEBUG.FORMS.REPORT}
                fieldName={REPORT_FORM_INPUT_IDS.CHAT_TYPE}
                fieldValue={CONST.REPORT.CHAT_TYPE.SYSTEM}
                onSubmit={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                text: CONST.REPORT.CHAT_TYPE.SYSTEM,
                isSelected: true,
            }),
        );
    });

    it('keeps natural filtered ordering while search is active', () => {
        render(
            <ConstantPicker
                formType={CONST.DEBUG.FORMS.REPORT}
                fieldName={REPORT_FORM_INPUT_IDS.CHAT_TYPE}
                fieldValue={CONST.REPORT.CHAT_TYPE.POLICY_ROOM}
                onSubmit={jest.fn()}
            />,
        );

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('policy');
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(searchedProps?.data.at(0)?.text).toBe(CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE);
        expect(searchedProps?.data.findIndex((item) => item.text === CONST.REPORT.CHAT_TYPE.POLICY_ROOM)).toBeGreaterThan(0);
    });
});
