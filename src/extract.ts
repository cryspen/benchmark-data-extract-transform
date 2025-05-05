/* eslint-disable @typescript-eslint/naming-convention */
import { promises as fs } from 'fs';
import { Config } from './config';

export interface BenchmarkResult {
    value: number;
    range?: string;
    unit: string;
    extra?: string;
    os: string;

    // from metadata
    [key: string]: any;
}

function addNameMetadataToResult(result: BenchmarkResult, nameString: string) {
    // split by separator
    const keyValuePairs = nameString.split('/');

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

function extractCargoResult(config: Config, output: string): BenchmarkResult[] {
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
