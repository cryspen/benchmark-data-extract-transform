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
