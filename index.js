const SECONDS_TO_MILLISECONDS = 1000;
const REMIND_MARKER = '<span id="review-reminder-remind" />';

const core = require('@actions/core');
const github = require('@actions/github');
const owner = github.context.payload.sender && github.context.payload.sender.login;
const repo = github.context.payload.repository && github.context.payload.repository.name;

async function run() {
  try {
    const token = core.getInput('token', { required: true });
    const expirationTime = core.getInput('expiration-time', { required: true });
    const message = core.getInput('message');

    const octokit = github.getOctokit(token);
    const expirationDate = new Date(Date.now() - (expirationTime * SECONDS_TO_MILLISECONDS));

    const pulls = await getPullRequests(octokit);
    pulls.forEach(async (pull) => {
      if (await needToRemind(octokit, pull, expirationDate)) {
        await remind(octokit, pull, message);
      }
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function getPullRequests(octokit) {
  const { data } = await octokit.rest.pulls.list({ owner, repo, state: 'open' });
  return data;
}

async function needToRemind(octokit, pull, expirationDate) {
  const createdDate = new Date(pull.created_at);
  const expired = createdDate <= expirationDate;
  if (!expired) {
    return false;
  }

  const { data } = await octokit.rest.issues.listComments({ owner, repo, issue_number: pull.number });
  const alreadyRemind = data.some(comment => comment.body.startsWith(REMIND_MARKER));
  return !alreadyRemind;
}

async function remind(octokit, pull, message) {
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: pull.number,
    body: `${REMIND_MARKER}${message}`,
  });
}

run();
