import _ from 'underscore';

function format(entry) {
    if (typeof entry === 'object') {
        try {
            return JSON.stringify(entry);
            // eslint-disable-next-line no-empty
        } catch (e) {}
    }

    return entry;
}

function log(...msgs) {
    process.stdout.write(`${_.map(msgs, format).join(' ')}\n`);
}

module.exports = {
    log,
    warn: log,
    error: log,
};
