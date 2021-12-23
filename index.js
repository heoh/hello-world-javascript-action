const SECONDS_TO_MILLISECONDS = 1000;
const REMIND_MARKER = '<span id="review-reminder-remind" />';

const core = require('@actions/core');
const github = require('@actions/github');
const owner = github.context.payload.sender && github.context.payload.sender.login;
const repo = github.context.payload.repository && github.context.payload.repository.name;

async function run() {
  try {
    const token = core.getInput('token', { required: true });
    const expiryPeriod = 60 * SECONDS_TO_MILLISECONDS;
    const message = "It's time to end this pull request!";

    const octokit = github.getOctokit(token);
    const expiryDate = new Date(Date.now() - expiryPeriod);

    const pulls = await getPullRequests(octokit);
    // const owner = github.context.payload.sender && github.context.payload.sender.login;
    // const repo = github.context.payload.repository && github.context.payload.repository.name;
    // const { data } = await octokit.rest.pulls.list({ owner, repo, state: 'open' });
    // const pulls = data;

    pulls.forEach(async (pull) => {
      if (await needToRemind(octokit, pull, expiryDate)) {
      // const createdDate = new Date(pull.created_at);
      // const { data: aa } = await octokit.rest.issues.listComments({ owner, repo, issue_number: pull.number });
      // const needToRemind = (createdDate <= expiryDate) && aa.some(comment => comment.body?.startsWith(REMIND_MARKER));
      // if (needToRemind) {
        await remind(octokit, pull, message);
      }
    });


    // const lastExpiryDate = new Date(Date.now() - expiryPeriod);
    // const isExpired = pr => (new Date(pr.created_at)) <= lastExpiryDate;

    // for (const pr of data) {
    //   if (!isExpired(pr) || !) {
    //     continue;
    //   }

    //   const createdDate = new Date(pr.created_at);
    //   const expiryDate = new Date(Date.parse(createdDate) + expiryPeriod);
    //   if (now >= expiryDate) {

    //   }
    // }

    // console.log(data);

    // console.log(`Hello ${token}!`);
    // const time = (new Date()).toTimeString();
    // core.setOutput("time", time);
    // // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2)
    // console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function getPullRequests(octokit) {
  const { data } = await octokit.rest.pulls.list({ owner, repo, state: 'open' });
  return data;
}

async function needToRemind(octokit, pull, expiryDate) {
  const createdDate = new Date(pull.created_at);
  const expired = createdDate <= expiryDate;
  if (!expired) {
    return false;
  }

  const { data } = await octokit.rest.issues.listComments({ owner, repo, issue_number: pull.number });
  const alreadyRemind = data.some(comment => comment.body?.startsWith(REMIND_MARKER));
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
