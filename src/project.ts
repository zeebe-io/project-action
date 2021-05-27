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
      let projectId: string;
      const issueId = await this.hub.getIssueId();

      if (this.input.id && this.input.id !== "") {
        projectId = this.input.id;
      } else {
        const projects = await this.hub.listProjects(this.input);
        if (projects.length == 0) {
          throw `No projects found for input ${this.input}`;
        }

        projectId = this.hub.getProjectId(projects, this.input);
      }

      await this.hub.setProject(issueId, projectId);
      core.info(`Assigned new issue to project ${this.input.name}`);
    } catch (error) {
      core.error(error.message);
      core.setFailed(error.message);
    }
  }
}
