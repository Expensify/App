// Mapped in jest.config.js for the package root and every subpath. Jest can't load the real package: its build is
// marked as an ES module, and the root also calls TurboModuleRegistry.getEnforcing('RNEntrustIDV'), which throws without the native module.
const StepNames = {
    Welcome: 'welcome',
    FacePhoto: 'facePhoto',
    FaceVideo: 'faceVideo',
    FaceMotion: 'faceMotion',
    Document: 'document',
    ProofOfAddress: 'proofOfAddress',
    Complete: 'complete',
};

const DocumentType = {
    DrivingLicence: 'driving_licence',
    GenericDocument: 'generic_document',
    NationalIdentityCard: 'national_identity_card',
    Passport: 'passport',
    PassportCard: 'passport_card',
    ResidencePermit: 'residence_permit',
};

class EntrustIdv {
    start = jest.fn();
}

const resolveLocalFont = jest.fn();
const Welcome = jest.fn(() => ({type: StepNames.Welcome}));
const Document = jest.fn((options?: unknown) => ({type: StepNames.Document, options}));
const FaceVideo = jest.fn((options?: unknown) => ({type: StepNames.FaceVideo, options}));

export {Document, DocumentType, EntrustIdv, FaceVideo, resolveLocalFont, StepNames, Welcome};
