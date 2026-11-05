import {act, render, screen} from '@testing-library/react-native';

import DynamicFormConfirmationPage from '@components/DynamicForm/components/DynamicFormConfirmationPage';
import type {DynamicFormSubPageProps} from '@components/DynamicForm/types';
import {getAllFields} from '@components/DynamicForm/utils/paginate';
import type {SummaryGroup} from '@components/SubStepForms/ConfirmationStep';
import Text from '@components/Text';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormPage} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React from 'react';

type CapturedConfirmationStepProps = {
    isLoading?: boolean;
    groups?: SummaryGroup[];
    isFixErrorsAlertVisible?: boolean;
    onFixTheErrorsLinkPressed?: () => void;
    pageSubtitle?: string;
    onNext: () => void;
    children?: ReactNode;
};

// The real step's children are drawn so the flow's own content can be found, while the rest of the step stays out of these tests
const mockConfirmationStep = jest.fn((props: CapturedConfirmationStepProps) => props.children ?? null);

jest.mock('@components/SubStepForms/ConfirmationStep', () => (props: CapturedConfirmationStepProps) => mockConfirmationStep(props));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

function renderPage(props: Partial<DynamicFormSubPageProps>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the page reads only a few of the flow's props, and the rest have no bearing on loading
    const pageProps = {
        isEditing: false,
        onNext: jest.fn(),
        onMove: jest.fn(),
        pages: [],
        allFields: [],
        values: {},
        formID: ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM,
        confirmationTitle: 'Confirm',
        onOpenListItemEditor: jest.fn(),
        ...props,
    } as unknown as DynamicFormSubPageProps;
    render(<DynamicFormConfirmationPage {...pageProps} />);
    return mockConfirmationStep.mock.lastCall?.[0].isLoading;
}

function getConfirmationStepProps(): CapturedConfirmationStepProps | undefined {
    return mockConfirmationStep.mock.lastCall?.[0];
}

function pressConfirm() {
    act(() => {
        getConfirmationStepProps()?.onNext();
    });
}

describe('DynamicFormConfirmationPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows Confirm loading while a page saved on the way is still saving', () => {
        // Given a screen that sends nothing on Confirm, whose last page is still saving
        // When the confirmation page renders
        const isLoading = renderPage({isSubmitting: false, isSavingPages: true});

        // Then Confirm shows that a save is running, so a tap that waits for it does not look ignored
        expect(isLoading).toBe(true);
    });

    it('stops loading once every page has saved', () => {
        // Given a screen that sends nothing on Confirm, whose pages have all saved
        // When the confirmation page renders
        const isLoading = renderPage({isSubmitting: false, isSavingPages: false});

        // Then Confirm is ready to press
        expect(isLoading).toBe(false);
    });

    it('shows Confirm loading while the screen sends the answers', () => {
        // Given a screen that is sending the answers, with no page saving
        // When the confirmation page renders
        const isLoading = renderPage({isSubmitting: true});

        // Then Confirm shows that the answers are on their way
        expect(isLoading).toBe(true);
    });

    it("draws the flow's own content and confirms straight away", () => {
        // Given a flow that puts a checkbox on its confirmation page, and checks it itself when the answers arrive
        const onNext = jest.fn();
        renderPage({onNext, children: <Text>Terms checkbox</Text>});

        // When the user presses Confirm
        pressConfirm();

        // Then the content shows above Confirm, and the answers go to the flow with nothing in their place, since the flow treats an argument as answers
        expect(screen.getByText('Terms checkbox')).toBeOnTheScreen();
        expect(onNext).toHaveBeenCalledWith();
    });

    it('shows the subtitle the flow passes', () => {
        // Given a flow with a subtitle for its confirmation page
        // When the page renders
        renderPage({confirmationSubtitle: 'Double check the details below'});

        // Then the step shows it under the title
        expect(getConfirmationStepProps()?.pageSubtitle).toBe('Double check the details below');
    });

    describe('unanswered fields', () => {
        const pages: DynamicFormPage[] = [
            {key: 'bank', title: 'Bank', content: [{key: 'sortCode', type: 'text', required: true, label: 'Sort code'}]},
            {key: 'holder', title: 'Holder', content: [{key: 'fullName', type: 'text', required: true, label: 'Full name'}]},
        ];
        const values = {fullName: 'Todd Clyde'};
        const getSortCodeRow = () =>
            getConfirmationStepProps()
                ?.groups?.at(0)
                ?.rows.find((row) => row.id === 'sortCode');

        it('marks the empty rows and asks to fix them once Confirm was pressed', () => {
            // Given the flow reports that Confirm was pressed while the sort code is empty, which happens when a new form from the server adds a required field
            const onMove = jest.fn();
            renderPage({pages, allFields: getAllFields(pages), values, onMove, shouldShowFieldErrors: true});

            // When the user presses the "fix the errors" link
            act(() => {
                getConfirmationStepProps()?.onFixTheErrorsLinkPressed?.();
            });

            // Then the sort code row shows why Confirm did nothing, the footer asks to fix it, and the link opens the bank page where the sort code is asked
            expect(getSortCodeRow()).toEqual(expect.objectContaining({brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR, errorText: 'common.error.fieldRequired'}));
            expect(getConfirmationStepProps()?.isFixErrorsAlertVisible).toBe(true);
            expect(onMove).toHaveBeenCalledWith(0);
        });

        it('shows no errors before Confirm is pressed', () => {
            // Given the same empty sort code, before the user pressed Confirm
            // When the confirmation page renders
            renderPage({pages, allFields: getAllFields(pages), values, shouldShowFieldErrors: false});

            // Then nothing is red yet, so a page the user is still reading does not start with errors
            expect(getSortCodeRow()).toEqual(expect.objectContaining({errorText: undefined}));
            expect(getConfirmationStepProps()?.isFixErrorsAlertVisible).toBe(false);
        });
    });
});
