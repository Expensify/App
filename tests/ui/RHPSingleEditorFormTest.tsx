import {render} from '@testing-library/react-native';

import TextBase from '@components/Rule/TextBase';

import {updateGeneralSettings} from '@libs/actions/Policy/Policy';
import {hasCircularReferences} from '@libs/Formula';

import EditReportFieldText from '@pages/EditReportFieldText';
import WorkspaceNamePage from '@pages/workspace/WorkspaceNamePage';

import ONYXKEYS from '@src/ONYXKEYS';
import EXPENSE_RULE_INPUT_IDS from '@src/types/form/ExpenseRuleForm';

import type {ComponentType, ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import createMock from '../utils/createMock';

type FormValues = Record<string, string>;
type FormProps = {
    children: ReactNode;
    onSubmit: (values: FormValues) => void;
    validate: (values: FormValues) => Record<string, string>;
    submitFlexEnabled?: boolean;
};
type InputProps = {
    autoGrowHeight?: boolean;
    autoGrowSingleLine?: boolean;
    maxAutoGrowHeight?: number;
};
type AutoGrowProps = {
    children: (maxAutoGrowHeight: number) => ReactNode;
};

const MockView = View;
const mockForm = jest.fn<void, [FormProps]>();
const mockInput = jest.fn<void, [InputProps]>();
const mockAutoGrow = jest.fn<void, [AutoGrowProps]>();

jest.mock('@components/AutoGrowHeightInputContainer', () => ({
    __esModule: true,
    default: (props: AutoGrowProps) => {
        const MockReact = jest.requireActual<typeof React>('react');
        mockAutoGrow(props);
        return MockReact.createElement(MockView, null, props.children(396));
    },
}));
jest.mock('@components/Form/FormProvider', () => ({
    __esModule: true,
    default: (props: FormProps) => {
        const MockReact = jest.requireActual<typeof React>('react');
        mockForm(props);
        return MockReact.createElement(MockReact.Fragment, null, props.children);
    },
}));
jest.mock('@components/Form/InputWrapper', () => ({
    __esModule: true,
    default: (props: InputProps) => {
        mockInput(props);
        return null;
    },
}));
jest.mock('@components/TextInput', () => () => null);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/ScreenWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: ReactNode}) => children,
}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: ReactNode}) => children,
}));
jest.mock('@pages/workspace/withPolicy', () => ({__esModule: true, default: (component: ComponentType) => component}));
jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: jest.fn()}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useReviewWorkspaceSettingsTaskCompletion', () => () => () => undefined);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({flex1: {}, flexGrow1: {}, ph5: {}, mb4: {}, mb5: {}}));
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {goBack: jest.fn(), setNavigationActionToMicrotaskQueue: jest.fn()},
}));
jest.mock('@libs/actions/Policy/Policy', () => ({updateGeneralSettings: jest.fn()}));
jest.mock('@libs/Formula', () => ({hasCircularReferences: jest.fn(() => false)}));

function getForm() {
    const form = mockForm.mock.calls.at(-1)?.[0];
    if (!form) {
        throw new Error('Expected the editor form to render');
    }
    return form;
}

describe('Single-editor RHP form boundaries', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('saves a wrapping workspace name as one line without changing other settings', () => {
        const props = createMock<React.ComponentProps<typeof WorkspaceNamePage>>({policy: {id: '1', name: 'Old name', outputCurrency: 'USD'}});
        render(<WorkspaceNamePage {...props} />);

        const values = {name: 'Design\r\nTeam\nEast'};
        expect(getForm().validate(values)).toEqual({});
        getForm().onSubmit(values);

        expect(updateGeneralSettings).toHaveBeenCalledWith(props.policy, 'Design Team East', 'USD', undefined);
        expect(values.name).toBe('Design\r\nTeam\nEast');
        expect(mockInput.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({autoGrowSingleLine: true, maxAutoGrowHeight: 396}));
        expect(getForm().submitFlexEnabled).toBe(false);
    });

    it('retains normalized report-field validation and saving when the editor grows', () => {
        const onSubmit = jest.fn();
        render(
            <EditReportFieldText
                fieldKey="title"
                fieldName="Title"
                fieldValue="Old title"
                isRequired
                onSubmit={onSubmit}
            />,
        );

        getForm().validate({title: '{field:Client\nName}'});
        getForm().onSubmit({title: '{field:Client\nName}'});

        expect(hasCircularReferences).toHaveBeenCalledWith('{field:Client Name}', 'Title', undefined);
        expect(onSubmit).toHaveBeenCalledWith({title: '{field:Client Name}'});
        expect(mockInput.mock.calls.at(-1)?.[0]?.maxAutoGrowHeight).toBe(396);
    });

    it('keeps a disabled formula field outside the growing editor', () => {
        render(
            <EditReportFieldText
                fieldKey="formula"
                fieldName="Formula"
                fieldValue="{report:total}"
                isRequired={false}
                onSubmit={jest.fn()}
                disabled
            />,
        );

        expect(mockAutoGrow).not.toHaveBeenCalled();
        expect(mockInput.mock.calls.at(-1)?.[0]?.maxAutoGrowHeight).toBeUndefined();
    });

    it('validates the same normalized rule value that is saved', () => {
        const onSubmit = jest.fn();
        render(
            <TextBase
                fieldID={EXPENSE_RULE_INPUT_IDS.RENAME_MERCHANT}
                formID={ONYXKEYS.FORMS.EXPENSE_RULE_FORM}
                title="Merchant"
                label="Merchant"
                characterLimit={3}
                onSubmit={onSubmit}
                isRequired
            />,
        );

        const values = {[EXPENSE_RULE_INPUT_IDS.RENAME_MERCHANT]: 'A\r\nB', [EXPENSE_RULE_INPUT_IDS.CATEGORY]: 'Travel'};
        expect(getForm().validate(values)).toEqual({});
        getForm().onSubmit(values);

        expect(onSubmit).toHaveBeenCalledWith({[EXPENSE_RULE_INPUT_IDS.RENAME_MERCHANT]: 'A B', [EXPENSE_RULE_INPUT_IDS.CATEGORY]: 'Travel'});
        expect(mockInput.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({autoGrowSingleLine: true, maxAutoGrowHeight: 396}));
    });

    it('preserves line breaks in a rule description', () => {
        const onSubmit = jest.fn();
        render(
            <TextBase
                fieldID={EXPENSE_RULE_INPUT_IDS.DESCRIPTION}
                formID={ONYXKEYS.FORMS.EXPENSE_RULE_FORM}
                title="Description"
                label="Description"
                onSubmit={onSubmit}
                isMarkdownEnabled
            />,
        );

        const values = {[EXPENSE_RULE_INPUT_IDS.DESCRIPTION]: 'First line\nSecond line'};
        getForm().onSubmit(values);

        expect(onSubmit).toHaveBeenCalledWith(values);
        expect(mockInput.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({autoGrowHeight: true, autoGrowSingleLine: false, maxAutoGrowHeight: 396}));
    });
});
