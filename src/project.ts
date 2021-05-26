import * as core from "@actions/core";
import { GithubApi, ProjectInput } from "./github";

export class Project {
  private input;
  private hub;

  constructor(input: ProjectInput, hub: GithubApi) {
    this.input = input;
    this.hub = hub;
  }

  async run(): Promise<void> {
    return this.hub
      .getIssueId()
      .then((issueId) => {
        this.hub
          .getProjectId(this.input)
          .then((projectId) => this.hub.setProject(issueId, projectId))
          .then(() =>
            console.log(`Assigned new issue to project ${this.input.name}`)
          );
      })
      .catch((error) => {
        console.error(error.message);
        core.setFailed(error.message);
      });
  }
}
