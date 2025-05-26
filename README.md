# GitHub Action for extraction and transformation of benchmark data

GitHub Action to transform benchmark output into a standardized format, and write to a file.

Currently supported sources:
 - `cargo bench`
 - `criterion`

## Fields
- `name` (required): name of the benchmark
- `tool` (required): tool used to get benchmark output. One of `["cargo"]`
- `os` (required): a string describing the os
- `output-file-path` (required): a path to a file containing the output of the benchmark tool
- `data-out-path` (required): the path where the output of the action should be written

## Metadata format

The benchmark name in the `cargo` benchmarks can be provided as a `,`-separated string where each item represents a key-value pair with the format `key=value`, e.g. `category=ML-KEM,keySize=44,name=PK Validation,platform=neon,api=unpacked`. Additionally, one of these separators may be a `/`, where the left-hand side represents the keys configured for a Criterion group, and the right-hand side represents the keys for a benchmark function on that group, e.g. `category=ML-KEM,keySize=44,name=PK Validation/platform=neon,api=unpacked`. Aside from this separator, no other `/` characters should be included in the name.

Alternatively, the benchmark name can be provided as a simple string, which will then be set as the value of the `name` key. This will only happen if there are no `key=value` pairs found in the benchmark name.

## Output data format

The output will be written to `data-out-path` in a standardized JSON format:
```json
[
  {
    "api": "unpacked",
    "category": "ML-KEM",
    "keySize": 768,
    "name": "PK Validation",
    "os": "ubuntu-latest",
    "platform": "neon",
    "range": "± 123",
    "unit": "ns/iter",
    "value": 12314,
  },
]
```
