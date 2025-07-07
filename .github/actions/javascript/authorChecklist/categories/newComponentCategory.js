"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectReactComponent = detectReactComponent;
var github = require("@actions/github");
var parser_1 = require("@babel/parser");
var traverse_1 = require("@babel/traverse");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var promiseSome_1 = require("@github/libs/promiseSome");
var items = [
    "I verified that similar component doesn't exist in the codebase",
    'I verified that all props are defined accurately and each prop has a `/** comment above it */`',
    'I verified that each file is named correctly',
    'I verified that each component has a clear name that is non-ambiguous and the purpose of the component can be inferred from the name alone',
    'I verified that the only data being stored in component state is data necessary for rendering and nothing else',
    "In component if we are not using the full Onyx data that we loaded, I've added the proper selector in order to ensure the component only re-renders when the data it is using changes",
    'For Class Components, any internal methods passed to components event handlers are bound to `this` properly so there are no scoping issues (i.e. for `onClick={this.submit}` the method `this.submit` should be bound to `this` in the constructor)',
    'I verified that component internal methods bound to `this` are necessary to be bound (i.e. avoid `this.submit = this.submit.bind(this);` if `this.submit` is never passed to a component event handler like `onClick`)',
    'I verified that all JSX used for rendering exists in the render method',
    'I verified that each component has the minimum amount of code necessary for its purpose, and it is broken down into smaller components in order to separate concerns and functions',
];
function isComponentOrPureComponent(name) {
    return name === 'Component' || name === 'PureComponent';
}
function detectReactComponent(code, filename) {
    if (!code) {
        console.error('failed to get code from a filename', code, filename);
        return;
    }
    var ast = (0, parser_1.parse)(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'], // enable jsx plugin
    });
    var isReactComponent = false;
    (0, traverse_1.default)(ast, {
        enter: function (path) {
            if (isReactComponent) {
                return;
            }
            if (path.isFunctionDeclaration() || path.isArrowFunctionExpression() || path.isFunctionExpression()) {
                path.traverse({
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    JSXElement: function () {
                        isReactComponent = true;
                        path.stop();
                    },
                });
            }
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ClassDeclaration: function (path) {
            var superClass = path.node.superClass;
            if (superClass &&
                ((superClass.object && superClass.object.name === 'React' && isComponentOrPureComponent(superClass.property.name)) || isComponentOrPureComponent(superClass.name))) {
                isReactComponent = true;
                path.stop();
            }
        },
    });
    return isReactComponent;
}
function nodeBase64ToUtf8(data) {
    return Buffer.from(data, 'base64').toString('utf-8');
}
function detectReactComponentInFile(filename) {
    return __awaiter(this, void 0, void 0, function () {
        var params, data, content, error_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    params = {
                        owner: CONST_1.default.GITHUB_OWNER,
                        repo: CONST_1.default.APP_REPO,
                        path: filename,
                        ref: (_b = (_a = github.context.payload) === null || _a === void 0 ? void 0 : _a.pull_request) === null || _b === void 0 ? void 0 : _b.head.ref,
                    };
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, GithubUtils_1.default.octokit.repos.getContent(params)];
                case 2:
                    data = (_d.sent()).data;
                    content = nodeBase64ToUtf8('content' in data ? ((_c = data === null || data === void 0 ? void 0 : data.content) !== null && _c !== void 0 ? _c : '') : '');
                    return [2 /*return*/, detectReactComponent(content, filename)];
                case 3:
                    error_1 = _d.sent();
                    console.error('An unknown error occurred with the GitHub API: ', error_1, params);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function detect(changedFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var filteredFiles, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filteredFiles = changedFiles.filter(function (_a) {
                        var filename = _a.filename, status = _a.status;
                        return status === 'added' && (filename.endsWith('.js') || filename.endsWith('.ts') || filename.endsWith('.tsx'));
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promiseSome_1.default)(filteredFiles.map(function (_a) {
                            var filename = _a.filename;
                            return detectReactComponentInFile(filename);
                        }), function (result) { return !!result; })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
                case 3:
                    err_1 = _a.sent();
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var newComponentCategory = {
    detect: detect,
    items: items,
};
exports.default = newComponentCategory;
