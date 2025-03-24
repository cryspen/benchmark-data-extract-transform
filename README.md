# GitHub Action for extraction and transformation of benchmark data

Currently supported sources:
 - `cargo bench`
 - `criterion`

## Fields
- `name` (required): name of the benchmark
- `platform` (required): a string describing the platform
- `output-file-path`: a path to a file containing the benchmark output
- `data-out-path`: the path where the output of the action should be written
