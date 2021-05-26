import * as core from "@actions/core";
import { GithubApi } from "./github";

export class Project {
  private projectId;
  private hub;

  constructor(projectId: number, hub: GithubApi) {
    this.projectId = projectId;  
    this.hub = hub;
  }

  async run(): Promise<void> {
    return this.hub.getIssueTitle()
    .then(title => this.hub.setProject(this.projectId, title))
    .then(() => console.log(`Assigned new issue to project ${this.projectId}`))
    .catch(error => {
        console.error(error.message);
        core.setFailed(error.message);  
    });
  }
}