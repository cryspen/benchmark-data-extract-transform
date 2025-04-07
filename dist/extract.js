"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractData = exports.localWriteBenchmark = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const fs_1 = require("fs");
function extractMetadataFromName(name_string) {
    // split by separator
    const values = name_string.split('/');
    // if only one arg provided, just return name
    if (values.length === 1) {
        const name = name_string;
        return { name, keySize: undefined, category: undefined, platform: undefined, api: undefined };
    }
    // extract by position
    const category = values[0] === '' ? undefined : values[0];
    // If keySize not a number, use `undefined`
    const keySizeParsed = parseInt(values[1]);
    const keySize = isNaN(keySizeParsed) ? undefined : keySizeParsed;
    // if name is not defined, keep entire name_string as name
    let name = values[2];
    if (name === undefined || name === '') {
        name = name_string;
    }
    const platform = values[3] === '' ? undefined : values[3];
    const api = values[4] === '' ? undefined : values[4];
    return {
        category,
        keySize,
        name,
        platform,
        api,
    };
}
function extractCargoResult(config, output) {
    const lines = output.split(/\r?\n/g);
    const ret = [];
    const reExtract = /^test (.+)\s+\.\.\. bench:\s+([0-9,.]+) (\w+\/\w+) \(\+\/- ([0-9,.]+)\)$/;
    const reComma = /,/g;
    for (const line of lines) {
        const m = line.match(reExtract);
        if (m === null) {
            continue;
        }
        const name_string = m[1].trim();
        const value = parseFloat(m[2].replace(reComma, ''));
        const unit = m[3].trim();
        const range = m[4].replace(reComma, '');
        // TODO: error handling
        const { category, keySize, name, platform, api } = extractMetadataFromName(name_string);
        ret.push({
            value,
            range: `± ${range}`,
            unit: unit,
            os: config.os,
            category,
            keySize,
            name,
            platform,
            api,
        });
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