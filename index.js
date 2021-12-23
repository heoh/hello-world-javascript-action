const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('token', { required: true });
    const octokit = github.getOctokit(token);
    const owner = github.context.payload.sender && github.context.payload.sender.login;
    const repo = github.context.payload.repository && github.context.payload.repository.name;
    const { data } = await octokit.pulls.list({ owner, repo, state: 'open' });
  
    console.log(data);
  
    console.log(`Hello ${token}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }  
}

run();
