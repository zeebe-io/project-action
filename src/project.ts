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
    try {
      const issueId = await this.hub.getIssueId();
      const projectId = await this.hub.getProjectId(this.input);
      await this.hub.setProject(issueId, projectId);

      console.log(`Assigned new issue to project ${this.input.name}`);
    } catch (error) {
      console.error(error.message);
      core.setFailed(error.message);
    }
  }
}
