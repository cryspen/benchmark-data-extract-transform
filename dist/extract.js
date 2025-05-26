"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractData = exports.localWriteBenchmark = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const fs_1 = require("fs");
function addNameMetadataToResult(result, nameString) {
    // replace first '/'
    // only one is allowed, as a Criterion group/function separator
    const nameStringProcessed = nameString.replace('/', ',');
    if (nameStringProcessed.includes('/')) {
        throw new Error("Only one '/' is allowed as a group/function separator");
    }
    const keyValuePairs = nameStringProcessed.split(',');
    let foundAtLeastOne = false;
    for (const pair of keyValuePairs) {
        const items = pair.split('=');
        if (items.length !== 2) {
            // invalid key-value pair
            continue;
        }
        const [key, value] = items;
        result[key] = value;
        // at least one key-value pair was found
        foundAtLeastOne = true;
    }
    if (!foundAtLeastOne) {
        // no key-value pairs found in string
        // return the entire string as the name
        result.name = nameString;
    }
}
function extractCargoResult(config, output) {
    const lines = output.split(/\r?\n/g);
    const ret = [];
    const reExtract = /^test (.+)\s+\.\.\. bench:\s+([0-9,.]+) ([0-9A-Za-z_\u03BC]+\/\w+)( \(\+\/- [0-9,.]+\))?$/;
    const reComma = /,/g;
    for (const line of lines) {
        const m = line.match(reExtract);
        if (m === null) {
            continue;
        }
        const value = parseFloat(m[2].replace(reComma, ''));
        const unit = m[3].trim();
        // if the range is provided, replace the prefix, the suffix, and any commas.
        const range = m[4] ? m[4].replace(reComma, '').replace(' (+/- ', '± ').replace(')', '') : undefined;
        const name_string = m[1].trim();
        const result = { value, range, unit, os: config.os };
        addNameMetadataToResult(result, name_string);
        ret.push(result);
    }
    return ret;
}
async function localWriteBenchmark(benches, config) {
    const data = JSON.stringify(benches);
    const outPath = config.dataOutPath;
    await fs_1.promises.writeFile(outPath, data);
}
exports.localWriteBenchmark = localWriteBenchmark;
async function extractData(config) {
    const output = await fs_1.promises.readFile(config.outputFilePath, 'utf8');
    const { tool } = config;
    let benches;
    switch (tool) {
        case 'cargo':
            benches = extractCargoResult(config, output);
            break;
        default:
            throw new Error(`FATAL: Unexpected tool: '${tool}'`);
    }
    if (benches.length === 0) {
        throw new Error(`No benchmark result was found in ${config.outputFilePath}. Benchmark output was '${output}'`);
    }
    return benches;
}
exports.extractData = extractData;
//# sourceMappingURL=extract.js.map