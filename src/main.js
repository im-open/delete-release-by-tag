const core = require('@actions/core');
const github = require('@actions/github');

// When used, this requiredArgOptions will cause the action to error if a value has not been provided.
const requiredArgOptions = {
  required: true,
  trimWhitespace: true
};

async function run() {
  const tag = core.getInput('release-tag', requiredArgOptions);
  const token = core.getInput('github-token', requiredArgOptions);

  const octokit = github.getOctokit(token);

  core.info('Checking if the release exists...');

  // Right now this throws an exception when the release does not exist
  // so it will be handled in the catch.
  let releaseId;
  await octokit.rest.repos
    .getReleaseByTag({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      tag: tag
    })
    .then(response => {
      releaseId = response.data.id;
      core.info(`The release with tag ${tag} exists.`);
    })
    .catch(() => {
      releaseId = null;
      core.info(`The release with tag ${tag} does not appear to exist.`);
    });

  if (releaseId != null) {
    core.info(`Deleting release with tag ${tag}...`);

    await octokit.rest.repos
      .deleteRelease({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        release_id: releaseId
      })
      .then(() => {
        core.info(`Finished deleting release with tag ${tag}.`);
      })
      .catch(error => {
        core.setFailed(`An error occurred deleting release with tag ${tag}: ${error.message}`);
      });
  }
}

run();
