# Project Action

A small Github Action which can assign a project to issues.

## Features & Limitations

This action can assign any project to a given issue, with the following caveats:

- Issues are assigned without a column, and are in `Awaiting triage` state
- You may need to specify a different GITHUB_TOKEN if you need privileged permissions, e.g. access organization projects
- If you have multiple projects with the same name, the behavior is undefined
- If the issue is already assigned to a project, it will potentially overwrite it. If it's already assigned to the same project, nothing happens.
- Unless you know the node ID of the project, the project _must_ be public, otherwise it will not show up when listing projects.

## Usage

The action accepts two environment variables, and 4 optional arguments:

### Environment variables

- `GITHUB_TOKEN`: it reads the token to use for authentication with the API via environment variables
- `PROJECT_ID`: if you already know the project's node ID (not the number in the URL), then you can set it here and it will skip the steps of finding the right project. This is the workaround if you have multiple projects of the same name.

### Arguments/input

> NOTE: all of this can be omitted if you specify the `PROJECT_ID`. They are only used to find the project ID. Otherwise, the project type, owner, and name, are all mandatory.

- `project_type`: one of `org`, `repo`, `user`. Select `org` if your project is owned by an organization, `repo` if it's under a particular repository, and `user` if it's a user project.
- `project_owner`: depending on the type, it will be: 
    - `org`: the organization key, e.g. `zeebe-io` here
    - `repo`: the repo's owner, e.g. `zeebe-io` here.
    - `user`: the username of repo's owner
- `project_repo`: the name of the repository. Only required if the type is `repo`.
- `project_name`: the name of the project, case-sensitive.

## Examples

### Repository project

Here's an example that assigns new and reopened issues to the given project. This project is a repository project, and as such must specify the owner of the repository, the repository name, and the project name.

```yaml
name: Assign new issues to the default project
on:
  issues:
    types: [ opened, reopened ]
jobs:
  assign:
    name: Assign to project
    runs-on: ubuntu-latest
    steps:
      - name: Assign to project
        uses: zeebe-io/project-action@develop
        with:
          project_type: "repo"
          project_owner: "zeebe-io"
          project_repo: "project-action"
          project_name: "Test"
```

### Organization project

For organization project, the default GITHUB_TOKEN is typically not enough. You will need to create a new token with admin read rights for your organization, and create a secret to hold that token.

For organization projects, you only need to specify the type, owner, and name of the project. In this case, owner refers to the organization itself.

```yaml
name: Assign new issues to the default project
on:
  issues:
    types: [ opened, reopened ]
jobs:
  assign:
    name: Assign to project
    runs-on: ubuntu-latest
    steps:
      - name: Assign to project
        uses: zeebe-io/project-action@develop
        env:
          GITHUB_TOKEN: ${{ secrets.ORG_TOKEN }}
        with:
          project_type: "org"
          project_owner: "zeebe-io"
          project_name: "Zeebe"
```

### User project

For a user project, the default GITHUB_TOKEN is typically not enough. You will need to create a new token with admin read rights for such a project, and create a secret to hold that token.

For user projects, you only need to specify the type, owner, and name of the project. In this case, owner refers to the username of the user owning the project.

```yaml
name: Assign new issues to the default project
on:
  issues:
    types: [ opened, reopened ]
jobs:
  assign:
    name: Assign to project
    runs-on: ubuntu-latest
    steps:
      - name: Assign to project
        uses: zeebe-io/project-action@develop
        env:
          GITHUB_TOKEN: ${{ secrets.USER_TOKEN }}
        with:
          project_type: "user"
          project_owner: "npepinpe"
          project_name: "Project"
```

### Using an ID directly

You can bypass having to find the node ID of your project if you already know it. If you know it, then you can omit the project type, owner, name, and repo, and simply specify the ID as an environment variable.

In that case, depending on the type of the project (org, repo, or user), you may need to also specify a new token which has the correct permissions to read that project.

```yaml
name: Assign new issues to the default project
on:
  issues:
    types: [ opened, reopened ]
jobs:
  assign:
    name: Assign to project
    runs-on: ubuntu-latest
    steps:
      - name: Assign to project
        uses: zeebe-io/project-action@develop
        env:
          GITHUB_TOKEN: ${{ secrets.USER_TOKEN }}
          PROJECT_ID: ${{ secrets.PROJECT_ID }}
```
