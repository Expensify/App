import {act, cleanup, fireEvent, render, screen, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import type * as FormProviderModule from '@components/Form/FormProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SelectionListProps} from '@components/SelectionList/types';
import type * as ValuePickerModule from '@components/ValuePicker';
import ValuePicker from '@components/ValuePicker';
import type {ValuePickerProps, ValueSelectorModalProps} from '@components/ValuePicker/types';
import type * as ValueSelectionListModule from '@components/ValuePicker/ValueSelectionList';

import type * as ReportActionsModule from '@libs/actions/Report';
import {addPolicyReport} from '@libs/actions/Report';

import WorkspaceNewRoomPage from '@pages/workspace/WorkspaceNewRoomPage';

import CONST from '@src/CONST';
import type * as FormKeysModule from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';

import type * as NavigationCore from '@react-navigation/core';
import type * as NativeNavigation from '@react-navigation/native';
import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const ONYXKEYS = jest.requireActual<typeof FormKeysModule>('@src/ONYXKEYS').default;

jest.mock('@react-navigation/core', () => ({
    ...jest.requireActual<typeof NavigationCore>('@react-navigation/core'),
    useIsFocused: () => true,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
    useRoute: () => ({key: 'new-room', name: 'NewRoom'}),
    usePreventRemove: () => {},
}));
jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({__esModule: true, default: () => ({didScreenTransitionEnd: true})}));
jest.mock('@src/hooks/useResponsiveLayout');
jest.mock('@libs/actions/Report', () => ({
    ...jest.requireActual<typeof ReportActionsModule>('@libs/actions/Report'),
    addPolicyReport: jest.fn<ReturnType<typeof addPolicyReport>, Parameters<typeof addPolicyReport>>(),
}));

let mockRoomForm: FormProviderModule.FormProviderProps<typeof ONYXKEYS.FORMS.NEW_ROOM_FORM> | undefined;
const mockRoomPickers = new Map<string, ValuePickerProps>();

jest.mock('@components/Form/FormProvider', () => {
    const ActualReact = jest.requireActual<typeof React>('react');
    const formKeys = jest.requireActual<typeof FormKeysModule>('@src/ONYXKEYS').default;
    const ActualForm = jest.requireActual<typeof FormProviderModule>('@components/Form/FormProvider').default;
    function isRoomForm<TFormID extends FormKeysModule.OnyxFormKey>(
        props: FormProviderModule.FormProviderProps<TFormID>,
    ): props is FormProviderModule.FormProviderProps<TFormID> & FormProviderModule.FormProviderProps<typeof ONYXKEYS.FORMS.NEW_ROOM_FORM> {
        return props.formID === formKeys.FORMS.NEW_ROOM_FORM;
    }
    function ObservedForm<TFormID extends FormKeysModule.OnyxFormKey>(props: FormProviderModule.FormProviderProps<TFormID>) {
        ActualReact.useEffect(() => {
            if (!isRoomForm(props)) {
                return;
            }
            mockRoomForm = props;
        }, [props]);
        return <ActualForm {...props} />;
    }
    return {__esModule: true, default: ObservedForm};
});

jest.mock('@components/ValuePicker', () => {
    const ActualReact = jest.requireActual<typeof React>('react');
    const ActualPicker = jest.requireActual<typeof ValuePickerModule>('@components/ValuePicker').default;
    function ObservedPicker(props: ValuePickerProps) {
        ActualReact.useEffect(() => {
            mockRoomPickers.set(props.label ?? '', props);
        }, [props]);
        return <ActualPicker {...props} />;
    }
    return {__esModule: true, default: ObservedPicker};
});

// Modal presentation stays below the real picker. The real list owns mapping and selection order.
jest.mock('@components/ValuePicker/ValueSelectorModal', () => {
    const RN = jest.requireActual<typeof ReactNative>('react-native');
    const ValueSelectionList = jest.requireActual<typeof ValueSelectionListModule>('@components/ValuePicker/ValueSelectionList').default;
    return ({label, ...props}: ValueSelectorModalProps) =>
        props.isVisible ? (
            <RN.View testID={`room-options-${label}`}>
                <ValueSelectionList {...props} />
            </RN.View>
        ) : null;
});

// The presentation boundary receives complete items mapped by ValueSelectionList, including keyForList.
jest.mock('@components/SelectionList', () => {
    const RN = jest.requireActual<typeof ReactNative>('react-native');
    return ({data, onSelectRow}: SelectionListProps<Parameters<NonNullable<ValueSelectorModalProps['onItemSelected']>>[0]>) => (
        <RN.View>
            {data.map((item) => (
                <RN.Text
                    key={item.keyForList}
                    testID={`room-option-${item.value}`}
                    onPress={() => onSelectRow(item)}
                >
                    {item.text}
                </RN.Text>
            ))}
        </RN.View>
    );
});

const adminPolicy = createMock<Policy>({id: 'admin-workspace', name: 'Admin workspace', type: CONST.POLICY.TYPE.TEAM, role: CONST.POLICY.ROLE.ADMIN});
const memberPolicy = createMock<Policy>({id: 'member-workspace', name: 'Member workspace', type: CONST.POLICY.TYPE.TEAM, role: CONST.POLICY.ROLE.USER});

function renderNewRoomPage(policyID?: string) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
            <WorkspaceNewRoomPage policyID={policyID} />
        </ComposeProviders>,
    );
}

function selectRoomOption(page: ReturnType<typeof renderNewRoomPage>, label: string, value: string) {
    const picker = page.UNSAFE_getAllByType(ValuePicker).find((node) => node.props.label === label);
    expect(picker).toBeDefined();
    if (!picker) {
        throw new Error('Expected the room picker');
    }
    const props = mockRoomPickers.get(label);
    expect(props).toBeDefined();
    if (!props) {
        throw new Error('Expected the observed room picker props');
    }
    expect(props.items?.some((item) => item.value === value)).toBe(true);
    // The actual ValuePicker owns its modal visibility through the menu item's press event.
    fireEvent.press(within(picker).getByRole('button'), createMock<ReactNative.GestureResponderEvent>({nativeEvent: {}}));
    fireEvent.press(screen.getByTestId(`room-option-${value}`));
}

describe('WorkspaceNewRoomPage option state and submit', () => {
    beforeEach(async () => {
        mockRoomForm = undefined;
        mockRoomPickers.clear();
        Onyx.init({keys: ONYXKEYS});
        jest.mocked(addPolicyReport).mockClear();
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(ONYXKEYS.SESSION, {email: 'member@example.com', accountID: 123});
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${adminPolicy.id}`, adminPolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${memberPolicy.id}`, memberPolicy);
            await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, adminPolicy.id);
        });
        await waitForBatchedUpdatesWithAct();
    });
    afterEach(() => {
        cleanup();
        jest.restoreAllMocks();
    });

    it.each(Object.values(CONST.REPORT.WRITE_CAPABILITIES))('submits selected capability %s and each offered visibility', async (capability) => {
        // Given an admin workspace, every current option should retain its exact production value.
        const page = renderNewRoomPage();
        await waitForBatchedUpdatesWithAct();
        const capabilities = page.UNSAFE_getAllByType(ValuePicker).find((node) => node.props.label === 'Who can post');
        expect(capabilities).toBeDefined();
        selectRoomOption(page, 'Who can post', capability);
        const visibilityPicker = page.UNSAFE_getAllByType(ValuePicker).find((node) => node.props.label === 'Visibility');
        expect(visibilityPicker).toBeDefined();
        const visibilityProps = mockRoomPickers.get('Visibility');
        expect(visibilityProps).toBeDefined();
        if (!visibilityProps) {
            throw new Error('Expected the visibility picker');
        }
        expect(visibilityProps.items?.map((item) => item.value)).toEqual(Object.values(CONST.REPORT.VISIBILITY).filter((value) => value !== CONST.REPORT.VISIBILITY.PUBLIC_ANNOUNCE));

        // When each real picker option reaches the mounted form's submit callback, state and submitted policy must agree.
        for (const visibility of Object.values(CONST.REPORT.VISIBILITY).filter((value) => value !== CONST.REPORT.VISIBILITY.PUBLIC_ANNOUNCE)) {
            selectRoomOption(page, 'Visibility', visibility);
            const form = mockRoomForm;
            expect(form).toBeDefined();
            if (!form) {
                throw new Error('Expected the actual room form');
            }
            act(() => form.onSubmit({roomName: '#test-room', reportDescription: '', policyID: adminPolicy.id, writeCapability: capability, visibility}));

            // Then the real optimistic report builder exposes any option-to-state or policy mapping mistake.
            expect(addPolicyReport).toHaveBeenCalled();
            const submitted = jest.mocked(addPolicyReport).mock.calls.at(-1);
            expect(submitted).toBeDefined();
            expect(submitted?.[0]).toEqual(expect.objectContaining({policyID: adminPolicy.id, writeCapability: capability, visibility}));
        }
    });

    it.each(['unmatched-room-option', undefined])('preserves room settings when picker value is %s', async (value) => {
        // Given deliberate room settings, unmatched picker values must not replace those choices.
        const page = renderNewRoomPage();
        await waitForBatchedUpdatesWithAct();
        selectRoomOption(page, 'Who can post', CONST.REPORT.WRITE_CAPABILITIES.ADMINS);
        selectRoomOption(page, 'Visibility', CONST.REPORT.VISIBILITY.PUBLIC);
        const capabilityPicker = mockRoomPickers.get('Who can post');
        const visibilityPicker = mockRoomPickers.get('Visibility');
        expect(capabilityPicker?.onInputChange).toBeDefined();
        expect(visibilityPicker?.onInputChange).toBeDefined();
        if (!capabilityPicker?.onInputChange || !visibilityPicker?.onInputChange) {
            throw new Error('Expected the mounted room picker callbacks');
        }

        // When a picker reports a missing or unmatched value, the actual selection handlers ignore it.
        act(() => {
            capabilityPicker.onInputChange?.(value);
            visibilityPicker.onInputChange?.(value);
        });
        const form = mockRoomForm;
        expect(form).toBeDefined();
        if (!form) {
            throw new Error('Expected the actual room form');
        }
        act(() =>
            form.onSubmit({
                roomName: '#test-room',
                reportDescription: '',
                policyID: adminPolicy.id,
                writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ADMINS,
                visibility: CONST.REPORT.VISIBILITY.PUBLIC,
            }),
        );

        // Then the submitted report retains both valid choices rather than resetting or accepting the unknown value.
        expect(addPolicyReport).toHaveBeenCalledTimes(1);
        expect(jest.mocked(addPolicyReport).mock.calls.at(0)?.[0]).toEqual(
            expect.objectContaining({writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ADMINS, visibility: CONST.REPORT.VISIBILITY.PUBLIC}),
        );
    });

    it('switches workspace and resets admin-only capability before submit', async () => {
        // Given an admin-only posting choice, switching to a member workspace must remove that capability.
        const page = renderNewRoomPage();
        await waitForBatchedUpdatesWithAct();
        selectRoomOption(page, 'Who can post', CONST.REPORT.WRITE_CAPABILITIES.ADMINS);

        // When a real workspace option is selected, the new workspace owns the report and resets restricted posting.
        selectRoomOption(page, 'Workspace', memberPolicy.id);
        await waitForBatchedUpdatesWithAct();
        const pickers = page.UNSAFE_getAllByType(ValuePicker);
        expect(pickers.some((node) => node.props.label === 'Who can post')).toBe(false);
        const form = mockRoomForm;
        expect(form).toBeDefined();
        if (!form) {
            throw new Error('Expected the actual room form');
        }
        act(() =>
            form.onSubmit({
                roomName: '#member-room',
                reportDescription: '',
                policyID: memberPolicy.id,
                visibility: CONST.REPORT.VISIBILITY.RESTRICTED,
                writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ALL,
            }),
        );

        // Then neither the old policy ID nor its admin capability leaks into the actual report.
        expect(addPolicyReport).toHaveBeenCalledTimes(1);
        expect(jest.mocked(addPolicyReport).mock.calls.at(0)?.[0]).toEqual(expect.objectContaining({policyID: memberPolicy.id, writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ALL}));
    });

    it('clears a removed workspace and adopts a valid active workspace', async () => {
        // Given a selected workspace that becomes unavailable, retaining it would submit stale policy state.
        renderNewRoomPage();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(adminPolicy.name)).toBeOnTheScreen();

        // When that policy disappears and the active policy changes, the real Onyx subscription must rebuild options.
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${adminPolicy.id}`, null);
            await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, memberPolicy.id);
        });
        await waitForBatchedUpdatesWithAct();

        // Then the picker and submitted report both use the surviving workspace.
        expect(screen.getByText(memberPolicy.name)).toBeOnTheScreen();
        const form = mockRoomForm;
        expect(form).toBeDefined();
        if (!form) {
            throw new Error('Expected the actual room form');
        }
        act(() =>
            form.onSubmit({
                roomName: '#surviving-room',
                reportDescription: '',
                policyID: memberPolicy.id,
                visibility: CONST.REPORT.VISIBILITY.RESTRICTED,
                writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ALL,
            }),
        );
        expect(addPolicyReport).toHaveBeenCalledTimes(1);
        expect(jest.mocked(addPolicyReport).mock.calls.at(0)?.[0].policyID).toBe(memberPolicy.id);
    });

    it('keeps the locked workspace as the submitted policy', async () => {
        // Given a locked workspace different from the active policy, selection must stay bound to the page's policy.
        const page = renderNewRoomPage(memberPolicy.id);
        await waitForBatchedUpdatesWithAct();

        // When the mounted form submits, no workspace picker can override the locked ID.
        expect(page.UNSAFE_getAllByType(ValuePicker).some((node) => node.props.label === 'Workspace')).toBe(false);
        const form = mockRoomForm;
        expect(form).toBeDefined();
        if (!form) {
            throw new Error('Expected the actual room form');
        }
        act(() =>
            form.onSubmit({
                roomName: '#locked-room',
                reportDescription: '',
                policyID: adminPolicy.id,
                visibility: CONST.REPORT.VISIBILITY.RESTRICTED,
                writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ALL,
            }),
        );

        // Then the real report builder receives the locked policy and default posting capability.
        expect(addPolicyReport).toHaveBeenCalledTimes(1);
        expect(jest.mocked(addPolicyReport).mock.calls.at(0)?.[0]).toEqual(expect.objectContaining({policyID: memberPolicy.id, writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ALL}));
    });
});
