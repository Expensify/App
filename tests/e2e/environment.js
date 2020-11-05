const {
    DetoxCircusEnvironment,
    SpecReporter,
    WorkerAssignReporter,
} = require('detox/runners/jest-circus');

class CustomDetoxEnvironment extends DetoxCircusEnvironment {
    constructor(config) {
        super(config);

        // This takes care of generating status logs on a per-spec basis. By default, Jest only reports at file-level.
        this.registerListeners({
            SpecReporter,
            WorkerAssignReporter,
        });
    }
}

module.exports = CustomDetoxEnvironment;
