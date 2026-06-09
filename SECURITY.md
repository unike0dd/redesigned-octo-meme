# Security Policy

## Supported scope

Security reports are accepted for the public Gabo Services website at <https://www.gabo.services> and for the static website files maintained in this repository.

## Responsible disclosure

If you believe you have found a vulnerability:

1. Report it privately to the repository maintainers through an appropriate private contact channel.
2. Describe the affected public page or file, the potential impact, and clear reproduction steps.
3. Use only the minimum proof needed to explain the issue, and avoid accessing, changing, or retaining data that does not belong to you.
4. Allow reasonable time for investigation and remediation before any public disclosure.

Do not submit vulnerability details, personal information, credentials, or other sensitive data through public issues, discussions, pull requests, or commit messages.

## Public repository expectations

- Do not commit secrets or confidential data to this public repository.
- Treat all HTML, CSS, JavaScript, JSON, YAML, and Markdown content as publicly readable.
- Keep repository metadata limited to information intended for website visitors and contributors.
- Use static assets from the repository and public website references appropriate for browser delivery.

## Static website security expectations

- Serve the public website over HTTPS.
- Keep dependencies and browser-facing code minimal and reviewable.
- Validate and sanitize untrusted input at the system that receives it; browser-side checks are not a security boundary.
- Apply suitable response security headers at deployment.
- Avoid exposing diagnostic details, confidential configuration, or non-public network locations in static files.
- Review changes for accidental sensitive-data disclosure and broken public references before deployment.
