import shouldYieldFocusToSidePanelComposer from '@pages/inbox/report/ReportActionCompose/shouldYieldFocusToSidePanelComposer';

const mainComposerAfterModalClose = {
    isInSidePanel: false,
    shouldHideSidePanel: false,
    didModalJustClose: true,
    hasSidePanelFocusClaim: true,
};

describe('shouldYieldFocusToSidePanelComposer', () => {
    it('yields while the Side Panel composer holds the claim', () => {
        expect(shouldYieldFocusToSidePanelComposer(mainComposerAfterModalClose)).toBe(true);
    });

    it('does not yield once the claim is released', () => {
        expect(shouldYieldFocusToSidePanelComposer({...mainComposerAfterModalClose, hasSidePanelFocusClaim: false})).toBe(false);
    });

    it('does not yield when the Side Panel is off screen, so a stale claim cannot strand focus', () => {
        expect(shouldYieldFocusToSidePanelComposer({...mainComposerAfterModalClose, shouldHideSidePanel: true})).toBe(false);
    });

    it('does not yield when the refocus is not coming from a closing modal', () => {
        expect(shouldYieldFocusToSidePanelComposer({...mainComposerAfterModalClose, didModalJustClose: false})).toBe(false);
    });

    it('never yields for the Side Panel composer itself', () => {
        expect(shouldYieldFocusToSidePanelComposer({...mainComposerAfterModalClose, isInSidePanel: true})).toBe(false);
    });
});
