# GitHub Action for extraction and transformation of benchmark data

GitHub Action to transform benchmark output into a standardized format, and write to a file.

Currently supported sources:
 - `cargo bench`
 - `criterion`

## Fields
- `name` (required): name of the benchmark
- `tool` (required): tool used to get benchmark output. One of `["cargo"]`
- `platform` (required): a string describing the platform
- `output-file-path` (required): a path to a file containing the output of the benchmark tool
- `data-out-path` (required): the path where the output of the action should be written

## Output data format

The output will be written to `data-out-path` in a standardized JSON format:
```json
[
    {
        "name": "My Custom Smaller Is Better Benchmark - Memory Used",
        "unit": "Megabytes",
        "platform": "ubuntu-latest",
        "value": 100,
        "range": "3",
    }
]
```
