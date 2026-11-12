import focusPDFScrollerWhenReady from '@components/PDFView/focusPDFScrollerWhenReady';

const PDF_FILE_NAME = 'Receipt.pdf';

/** Mirrors the DOM react-fast-pdf renders once a PDF loads: react-window's focusable outer div inside react-pdf's Document. */
function createPDFDocument(): {document: HTMLDivElement; scroller: HTMLDivElement; page: HTMLDivElement} {
    const pdfDocument = document.createElement('div');
    pdfDocument.className = 'react-pdf__Document';
    const scroller = document.createElement('div');
    scroller.tabIndex = -1;
    const page = document.createElement('div');
    page.tabIndex = 0;
    scroller.appendChild(page);
    pdfDocument.appendChild(scroller);
    return {document: pdfDocument, scroller, page};
}

/** Mirrors the password form, whose wrapper is also focusable with tabIndex=-1 but renders outside the Document. */
function createPasswordForm(): {form: HTMLDivElement; input: HTMLInputElement} {
    const form = document.createElement('div');
    form.tabIndex = -1;
    const input = document.createElement('input');
    form.appendChild(input);
    return {form, input};
}

/** MutationObserver callbacks run as microtasks, so let them flush before asserting. */
async function flushMutationObservers() {
    await Promise.resolve();
}

describe('focusPDFScrollerWhenReady', () => {
    let container: HTMLDivElement;
    let headerButton: HTMLButtonElement;
    let disconnectSpy: jest.SpyInstance;

    beforeEach(() => {
        headerButton = document.createElement('button');
        container = document.createElement('div');
        document.body.append(headerButton, container);
        disconnectSpy = jest.spyOn(MutationObserver.prototype, 'disconnect');
    });

    afterEach(() => {
        disconnectSpy.mockRestore();
        document.body.innerHTML = '';
    });

    it('focuses the scroller right away when the PDF has already rendered', () => {
        // Given an attachment modal reopened on a cached PDF, so the scroller is already rendered and focus fell back to the body
        const {document: pdfDocument, scroller} = createPDFDocument();
        container.appendChild(pdfDocument);
        expect(document.activeElement).toBe(document.body);

        // When the PDF view tries to focus the scroller
        focusPDFScrollerWhenReady(container, PDF_FILE_NAME);

        // Then the scroller is focused so arrow keys scroll the PDF instead of the chat behind the modal
        expect(document.activeElement).toBe(scroller);

        // And it is named with the file name, so screen readers announce the PDF instead of only "group"
        expect(scroller.getAttribute('role')).toBe('group');
        expect(scroller.getAttribute('aria-label')).toBe(PDF_FILE_NAME);
    });

    it('focuses the scroller once it renders after the PDF loads, then stops watching', async () => {
        // Given a PDF that is still loading, so only the loading indicator is rendered
        container.appendChild(document.createElement('div'));
        focusPDFScrollerWhenReady(container, PDF_FILE_NAME);
        expect(disconnectSpy).not.toHaveBeenCalled();

        // When the PDF finishes loading and the scroller renders
        const {document: pdfDocument, scroller} = createPDFDocument();
        container.appendChild(pdfDocument);
        await flushMutationObservers();

        // Then the scroller is focused and the observer disconnects, because there is nothing left to wait for
        expect(document.activeElement).toBe(scroller);
        expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });

    it('does not focus the password form wrapper and focuses the scroller after a wrong-password retry', async () => {
        // Given a password-protected PDF, whose password form wrapper also has tabIndex=-1
        const {form, input} = createPasswordForm();
        container.appendChild(form);
        focusPDFScrollerWhenReady(container, PDF_FILE_NAME);

        // Then the wrapper is not mistaken for the scroller, because it renders outside the Document
        expect(document.activeElement).toBe(document.body);

        // When the user types a wrong password and the form shows an error
        input.focus();
        form.appendChild(document.createElement('span'));
        await flushMutationObservers();

        // Then focus stays in the password input and the observer keeps watching, because the PDF is still locked
        expect(document.activeElement).toBe(input);
        expect(disconnectSpy).not.toHaveBeenCalled();

        // When the user enters the right password and the PDF renders in place of the form
        form.remove();
        const {document: pdfDocument, scroller} = createPDFDocument();
        container.appendChild(pdfDocument);
        await flushMutationObservers();

        // Then the scroller is focused, because focus was inside the PDF view and can move to the scroller
        expect(document.activeElement).toBe(scroller);
        expect(disconnectSpy).toHaveBeenCalledTimes(1);

        // And the scroller that renders after unlocking is named with the file name
        expect(scroller.getAttribute('aria-label')).toBe(PDF_FILE_NAME);
        expect(form.hasAttribute('aria-label')).toBe(false);
    });

    it('does not take focus from elements outside the PDF view', async () => {
        // Given the user moved focus to a modal header button while the PDF was loading
        focusPDFScrollerWhenReady(container, PDF_FILE_NAME);
        headerButton.focus();

        // When the PDF finishes loading and the scroller renders
        const {document: pdfDocument, scroller} = createPDFDocument();
        container.appendChild(pdfDocument);
        await flushMutationObservers();

        // Then focus stays on the header button so a keyboard user is not pulled away from it, and the observer still stops
        expect(document.activeElement).toBe(headerButton);
        expect(disconnectSpy).toHaveBeenCalledTimes(1);

        // And the scroller is still named, so it is announced correctly when the user moves focus to it later
        expect(scroller.getAttribute('aria-label')).toBe(PDF_FILE_NAME);
    });

    it('does not move focus that is already inside the scroller', () => {
        // Given focus is already on an element inside the scroller, like a PDF page
        const {document: pdfDocument, page} = createPDFDocument();
        container.appendChild(pdfDocument);
        page.focus();

        // When the PDF view tries to focus the scroller again, like after the carousel switches back to this PDF
        focusPDFScrollerWhenReady(container, PDF_FILE_NAME);

        // Then focus stays where the user put it
        expect(document.activeElement).toBe(page);
    });

    it('stops watching when cleaned up before the PDF renders', async () => {
        // Given a PDF that is still loading
        const cleanup = focusPDFScrollerWhenReady(container, PDF_FILE_NAME);

        // When the PDF view unmounts or loses focus in the carousel before the PDF loads
        cleanup();
        expect(disconnectSpy).toHaveBeenCalledTimes(1);

        // Then a scroller that renders later is not focused, because the observer no longer runs
        container.appendChild(createPDFDocument().document);
        await flushMutationObservers();
        expect(document.activeElement).toBe(document.body);
    });

    it('does not create an observer when the scroller is already rendered', () => {
        // Given a scroller that is already rendered
        container.appendChild(createPDFDocument().document);
        const observeSpy = jest.spyOn(MutationObserver.prototype, 'observe');

        // When the PDF view focuses the scroller and is then cleaned up
        const cleanup = focusPDFScrollerWhenReady(container, PDF_FILE_NAME);
        cleanup();

        // Then no observer was started, so there is nothing left running after cleanup
        expect(observeSpy).not.toHaveBeenCalled();
        expect(disconnectSpy).not.toHaveBeenCalled();
        observeSpy.mockRestore();
    });
});
