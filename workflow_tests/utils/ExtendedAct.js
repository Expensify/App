const kieActJs = require('@kie/act-js');

class ExtendedAct extends kieActJs.Act {
    async parseRunOpts(opts) {
        const {cwd, actArguments, proxy} = await super.parseRunOpts(opts);
        if (opts?.actor) {
            actArguments.push('--actor', opts?.actor);
        }
        return {cwd, actArguments, proxy};
    }
}

module.exports = {
    ExtendedAct,
};
