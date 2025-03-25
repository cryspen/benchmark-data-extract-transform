"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configFromJobInput = exports.VALID_TOOLS = void 0;
const core = __importStar(require("@actions/core"));
const fs_1 = require("fs");
const os = __importStar(require("os"));
const path = __importStar(require("path"));
exports.VALID_TOOLS = ['cargo'];
function validateToolType(tool) {
    if (exports.VALID_TOOLS.includes(tool)) {
        return;
    }
    throw new Error(`Invalid value '${tool}' for 'tool' input. It must be one of ${exports.VALID_TOOLS}`);
}
function resolvePath(p) {
    if (p.startsWith('~')) {
        const home = os.homedir();
        if (!home) {
            throw new Error(`Cannot resolve '~' in ${p}`);
        }
        p = path.join(home, p.slice(1));
    }
    return path.resolve(p);
}
async function resolveFilePath(p) {
    p = resolvePath(p);
    let s;
    try {
        s = await fs_1.promises.stat(p);
    }
    catch (e) {
        throw new Error(`Cannot stat '${p}': ${e}`);
    }
    if (!s.isFile()) {
        throw new Error(`Specified path '${p}' is not a file`);
    }
    return p;
}
async function validateOutputFilePath(filePath) {
    try {
        return await resolveFilePath(filePath);
    }
    catch (err) {
        throw new Error(`Invalid value for 'output-file-path' input: ${err}`);
    }
}
async function validateDataOutPath(filePath) {
    try {
        // TODO: validate
        return filePath;
    }
    catch (err) {
        throw new Error(`Invalid value for 'data-out-path' input: ${err}`);
    }
}
function validateName(name) {
    if (name) {
        return;
    }
    throw new Error('Name must not be empty');
}
function validatePlatform(platform) {
    if (platform) {
        return;
    }
    throw new Error('Platform must not be empty');
}
async function configFromJobInput() {
    const tool = core.getInput('tool');
    let outputFilePath = core.getInput('output-file-path');
    let dataOutPath = core.getInput('data-out-path');
    const name = core.getInput('name');
    const platform = core.getInput('platform');
    validateName(name);
    validatePlatform(platform);
    validateToolType(tool);
    outputFilePath = await validateOutputFilePath(outputFilePath);
    dataOutPath = await validateDataOutPath(dataOutPath);
    return {
        name,
        tool,
        outputFilePath,
        dataOutPath,
        platform,
    };
}
exports.configFromJobInput = configFromJobInput;
//# sourceMappingURL=config.js.map