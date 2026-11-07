# Security Policy

This repository hosts **karun99.github.io**, a static website published with
GitHub Pages. It contains HTML, CSS, and client-side JavaScript. It has no
first-party server, database, login, or user-account system.

## Supported versions

| Version | Supported |
| --- | --- |
| Latest commit on `main` (the deployed site) | :white_check_mark: |
| Older commits, forks, and archived copies | :x: — best effort only |

## Scope

**In scope:** vulnerabilities in this repository's own HTML, CSS, JavaScript,
build/deploy configuration, and GitHub Actions workflows — for example
cross-site scripting in first-party code, secret exposure, unsafe third-party
embeds, and supply-chain issues in the workflows.

**Out of scope:** the projects and external sites this website links to. Each
has its own security policy; report issues there. Also out of scope are
content-accuracy disputes, broken links with no security impact, and
denial-of-service against GitHub Pages itself.

## Dependency and supply-chain hygiene

- The site is static and has no npm/package manifest. Its main executable
  dependency surface is the **GitHub Actions** used for deployment and
  maintenance.
- Dependabot monitors GitHub Actions in this repository (see
  `.github/dependabot.yml`) and opens grouped, reviewable update PRs. Updates
  are not auto-merged.
- Workflow changes are reviewed before merge. Third-party actions should be
  pinned to a commit SHA where practical.
- No credentials, tokens, or private keys are committed. Deployment uses
  GitHub's scoped `GITHUB_TOKEN`.

## Incident response

1. **Triage:** every security alert or report is reviewed within 24 hours and
   classified Critical / High / Medium / Low.
2. **Remediation:** Critical within 48 hours, High within 7 days, Medium within
   30 days, Low within 90 days.
3. **Containment:** if a secret is exposed, revoke and rotate it first, then
   remove it from the repository and history.
4. **Verification:** confirm the fix on the deployed site and, where relevant,
   ask the reporter to retest.
5. **Post-incident review:** a short post-mortem is written for every
   Critical/High incident covering root cause, timeline, and preventive action.

## Reporting a vulnerability

Use GitHub's private security advisory flow:

1. Open the **Security** tab of
   [karun99/karun99.github.io](https://github.com/karun99/karun99.github.io).
2. Choose **Report a vulnerability**.
3. Include the affected URL or commit, impact, and reproduction steps.

**Acknowledgement:** within 3 business days. Please do **not** open a public
issue for secret exposure, cross-site scripting, or data-leak reports.

For issues in a linked project rather than this website, use that project's
repository and its own security policy.

## Disclosure policy

- We aim to fix the issue before public disclosure.
- Coordinated disclosure window: **90 days**, or sooner by mutual agreement.
- Credit is given in the advisory or release notes unless you ask to remain
  anonymous.
- Reports are kept confidential and shared only with the maintainers.
