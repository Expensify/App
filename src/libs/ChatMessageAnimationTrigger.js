
let callback;
function register(cb) {
    callback = cb;
}

function trigger(type) {
    callback(type);
}

export {
    register,
    trigger,
};
