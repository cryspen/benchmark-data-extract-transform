"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractData = exports.localWriteBenchmark = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const fs_1 = require("fs");
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
        const name = m[1].trim();
        const value = parseFloat(m[2].replace(reComma, ''));
        const unit = m[3].trim();
        const range = m[4].replace(reComma, '');
        ret.push({
            name,
            value,
            range: `± ${range}`,
            unit: unit,
            platform: config.platform,
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