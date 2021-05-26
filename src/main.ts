import * as core from "@actions/core";
import { Github, GithubApi } from "./github";
import { Project } from "./project";

/**
 * Called from the action.yml.
 */
async function run(): Promise<void> {
  const token = core.getInput("github_token", { required: true });
  const projectId: number = +core.getInput("project_id", { required: true });
  const hub = new Github(token);
  const project = new Project(projectId, hub);

  return project.run();
}

// this would be executed on import in a test file
run();
