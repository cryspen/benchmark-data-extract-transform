# GitHub Action for extraction and transformation of benchmark data

GitHub Action to transform benchmark output into a standardized format, and write to a file.

Currently supported sources:
 - `cargo bench`
 - `criterion`

## Fields
- `name` (required): name of the benchmark. This can optionally be specified with a given metadata format (see below)
- `tool` (required): tool used to get benchmark output. One of `["cargo"]`
- `os` (required): a string describing the os
- `output-file-path` (required): a path to a file containing the output of the benchmark tool
- `data-out-path` (required): the path where the output of the action should be written

## Metadata format

The `name` field can be provided as a `/`-separated string with the format `category/key size/name/platform/api`. The key size should be an integer. Some fields in this string can be left blank. Any unspecified or invalid fields will be parsed to `undefined`.

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
