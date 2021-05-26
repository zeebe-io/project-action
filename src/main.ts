import * as core from "@actions/core";
import { Github, ProjectInput } from "./github";
import { Project } from "./project";

/**
 * Called from the action.yml.
 */
async function run(): Promise<void> {
  const token = core.getInput("github_token", { required: true });
  const hub = new Github(token);

  const project_type = core.getInput("project_type", { required: false });
  const project_owner = core.getInput("project_owner", { required: false });
  const project_repo = core.getInput("project_repo", { required: false });
  const project_name = core.getInput("project_name", { required: false });
  const project_id = core.getInput("project_id", { required: false });

  const input = new ProjectInput(
    project_type,
    project_owner,
    project_repo,
    project_name,
    project_id
  );
  const project = new Project(input, hub);

  return project.run();
}

// this would be executed on import in a test file
run();
