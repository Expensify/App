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

const ThemeMode = {
    Light: 'Light',
    Dark: 'Dark',
};

type Callbacks = {
    onComplete?: (result: Record<string, unknown>) => void;
    onUserExit?: (userAction: string) => void;
    // Native sends `type` as a string on Android and as an encoded Swift enum case on iOS, and never sends `category`
    onError?: (error: {type: unknown; category?: string; message?: string}) => void;
};

// Keeps every instance and the callbacks it was constructed with, so a test can drive success, exit and error.
// Tests import this file directly to get these types, and clear `instances` between cases.
class EntrustIdv {
    static instances: EntrustIdv[] = [];

    callbacks: Callbacks;

    start = jest.fn();

    constructor(callbacks: Callbacks) {
        this.callbacks = callbacks;
        EntrustIdv.instances.push(this);
    }
}

const resolveLocalFont = jest.fn();
const Welcome = jest.fn(() => ({type: StepNames.Welcome}));
const Document = jest.fn((options?: unknown) => ({type: StepNames.Document, options}));
const FaceVideo = jest.fn((options?: unknown) => ({type: StepNames.FaceVideo, options}));

export {Document, DocumentType, EntrustIdv, FaceVideo, resolveLocalFont, StepNames, ThemeMode, Welcome};
