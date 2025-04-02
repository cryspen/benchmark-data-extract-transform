/* eslint-disable @typescript-eslint/naming-convention */
import { promises as fs } from 'fs';
import { Config } from './config';

export interface BenchmarkResult {
    value: number;
    range?: string;
    unit: string;
    extra?: string;
    os: string;

    // from NameMetadata
    category: string;
    keySize: number;
    name: string;
    platform: string;
    api: string;
}

interface NameMetadata {
    category: string;
    keySize: number;
    name: string;
    platform: string;
    api: string;
}
function extractMetadataFromName(name_string: string): NameMetadata {
    // split by separator
    const values = name_string.split('/');

    // extract by position
    const category = values[0];
    const keySize = parseInt(values[1]);
    const name = values[2];
    const platform = values[3];
    const api = values[4];

    return {
        category,
        keySize,
        name,
        platform,
        api,
    };
}

function extractCargoResult(config: Config, output: string): BenchmarkResult[] {
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

export async function localWriteBenchmark(benches: BenchmarkResult[], config: Config) {
    const data = JSON.stringify(benches);
    const outPath = config.dataOutPath;
    await fs.writeFile(outPath, data);
}

export async function extractData(config: Config): Promise<BenchmarkResult[]> {
    const output = await fs.readFile(config.outputFilePath, 'utf8');
    const { tool } = config;
    let benches: BenchmarkResult[];

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
