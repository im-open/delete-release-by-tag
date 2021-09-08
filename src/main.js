const core = require('@actions/core');
const github = require('@actions/github');

const token = core.getInput('github-token');
const tag = core.getInput('release-tag');

if (!token || token.length === 0) {
  core.setFailed('The token is required');
  return;
}
if (!tag || tag.length === 0) {
  core.setFailed('The tag is required');
  return;
}

async function run() {
  const octokit = github.getOctokit(token);

  core.info('Checking if the release exists...');

  try {
    // Right now this throws an exception when the release does not exist
    // so it will be handled in the catch.  Adding the status check below
    // in case the implementation changes.
    const response = await octokit.rest.repos.getReleaseByTag({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      tag: tag
    });

    if (response && response.status == 200) {
      core.info(`The release with tag ${tag} exists.`);
      core.info(`Deleting release with tag ${tag}...`);

      const releaseId = response.data.id;
      await octokit.rest.repos.deleteRelease({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        release_id: releaseId
      });
      core.info(`Finished deleting release with tag ${tag}.`);
    } else {
      core.info(
        `The response had a status code of ${response.status}.  The release with tag ${tag} does not appear to exist.`
      );
    }
  } catch (error) {
    core.info(`The release with tag ${tag} does not appear to exist.`);
  }
}

run();
