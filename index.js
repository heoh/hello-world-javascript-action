const SECONDS_TO_MILLISECONDS = 1000;

const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('token', { required: true });
    const expiryPeriod = 60 * SECONDS_TO_MILLISECONDS;
    const message = "It's time to end this Pull Request!";

    const octokit = github.getOctokit(token);
    const expiryDate = new Date(Date.now() - expiryPeriod);

    // const pulls = await getPullRequests(octokit);
    const owner = github.context.payload.sender && github.context.payload.sender.login;
    const repo = github.context.payload.repository && github.context.payload.repository.name;
    const { data } = await octokit.rest.pulls.list({ owner, repo, state: 'open' });
    const pulls = data;

    for (const pull of pulls) {
      // if (needToRemind(pull, expiryDate)) {
      const createdDate = new Date(pull.created_at);
      const needToRemind = (createdDate <= expiryDate);

      if (needToRemind) {
        console.log(pull._links.comments);
        // remind(pull, message);
      }
    }


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
  const owner = github.context.payload.sender && github.context.payload.sender.login;
  const repo = github.context.payload.repository && github.context.payload.repository.name;
  const { data } = await octokit.rest.pulls.list({ owner, repo, state: 'open' });
  return data;
}

function needToRemind()

run();
