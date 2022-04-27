# delete-release-by-tag

This action can be used to delete a GitHub Release by tag when one exists.  If the release does not exist, the action will simply return.

This functionality is also in the [im-open/create-release] action.  You may wish to use this standalone action if the release needs to be deleted before an action to create a new release or if you have a workflow that cleans up old releases.

## Index

- [Inputs](#inputs)
- [Outputs](#outputs)
- [Usage Examples](#usage-examples)
- [Contributing](#contributing)
  - [Recompiling](#recompiling)
  - [Incrementing the Version](#incrementing-the-version)
- [Code of Conduct](#code-of-conduct)
- [License](#license)
  
## Inputs
| Parameter      | Is Required | Description                                                                                  |
| -------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `github-token` | true        | A GitHub token with permission to delete releases.  Generally `${{ secrets.GITHUB_TOKEN }}`. |
| `release-tag`  | true        | The tag of the release to delete                                                             |

## Outputs
No outputs

## Usage Examples

```yml
on: 
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  create-prebuilt-artifacts-release:
    runs-on: ubuntu-20.04
    steps:
      - uses: actions/checkout@v2
        with: 
          fetch-depth: 0

      - name: Calculate next version
        id: version
        uses: im-open/git-version-lite@v2.0.6
        with:
          calculate-prerelease-version: true
          branch-name: ${{ github.head_ref }}

      # The release might already exist if you hit 're-run jobs' on a workflow run that already
      # completed once. Creating a release when one already exists will fail, so delete it first.
      - name: Delete release if it exists
        uses: im-open/delete-release-by-tag@v1.0.5
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          release-tag: ${{ steps.version.outputs.VERSION }}
      
      - name: Create release
        id: create_release
        uses: im-open/create-release@v2.0.1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag-name: ${{ env.VERSION }}
          release-name: ${{ env.VERSION }}
      
      . . .
```

## Contributing

When creating new PRs please ensure:
1. The action has been recompiled.  See the [Recompiling](#recompiling) section below for more details.
2. For major or minor changes, at least one of the commit messages contains the appropriate `+semver:` keywords listed under [Incrementing the Version](#incrementing-the-version).
3. The `README.md` example has been updated with the new version.  See [Incrementing the Version](#incrementing-the-version).
4. The action code does not contain sensitive information.

### Recompiling

If changes are made to the action's code in this repository, or its dependencies, you will need to re-compile the action.

```sh
# Installs dependencies and bundles the code
npm run build

# Bundle the code (if dependencies are already installed)
npm run bundle
```

These commands utilize [esbuild](https://esbuild.github.io/getting-started/#bundling-for-node) to bundle the action and
its dependencies into a single file located in the `dist` folder.

### Incrementing the Version

This action uses [git-version-lite] to examine commit messages to determine whether to perform a major, minor or patch increment on merge.  The following table provides the fragment that should be included in a commit message to active different increment strategies.
| Increment Type | Commit Message Fragment                     |
| -------------- | ------------------------------------------- |
| major          | +semver:breaking                            |
| major          | +semver:major                               |
| minor          | +semver:feature                             |
| minor          | +semver:minor                               |
| patch          | *default increment type, no comment needed* |

## Code of Conduct

This project has adopted the [im-open's Code of Conduct](https://github.com/im-open/.github/blob/master/CODE_OF_CONDUCT.md).

## License

Copyright &copy; 2021, Extend Health, LLC. Code released under the [MIT license](LICENSE).

[git-version-lite]: https://github.com/im-open/git-version-lite
[im-open/create-release]: https://github.com/im-open/create-release