# Gabriel Services Static Site

This repository contains the production static website for **Gabriel Services**. The site presents operational support services, Careers intake, Contact intake, legal notices, PWA fallback behavior, and the `gabo io` chatbot frontend.

The repo is intentionally build-light: production pages load plain HTML, CSS, and browser JavaScript directly from this repository.

## Site map

| Route | Purpose | Source file |
| --- | --- | --- |
| `/` | Home / landing page | `index.html` |
| `/about.html` | Company positioning and operating approach | `about.html` |
| `/services.html` | The single Services route and service-lane index | `services.html` |
| `/services/logistics-operations.html` | Logistics Operations service detail | `services/logistics-operations.html` |
| `/services/administrative-backoffice.html` | Administrative Back Office service detail | `services/administrative-backoffice.html` |
| `/services/customer-relations.html` | Customer Relations service detail | `services/customer-relations.html` |
| `/services/it-support.html` | IT Support service detail | `services/it-support.html` |
| `/careers.html` | Careers application form | `careers.html` |
| `/contact.html` | Contact/request form | `contact.html` |
| `/legal/terms.html` | Terms | `legal/terms.html` |
| `/legal/cookies.html` | Cookie notice | `legal/cookies.html` |
| `/legal/privacy-gdpr.html` | Privacy/GDPR notice | `legal/privacy-gdpr.html` |
| `/offline.html` | PWA offline fallback only; not a sitemap route | `offline.html` |

## Production source ownership

Use these files as the production source of truth:

| Concern | Canonical file(s) | Notes |
| --- | --- | --- |
| Global styles | `assets/styles.css` | Shared across every page. |
| Theme toggle | `assets/theme.js` | Loads before page paint where possible. |
| Runtime i18n | `assets/i18n.js` | Spanish is currently runtime language switching, not route-based `/es/` localization. Do not add Spanish routes until self-canonicals, hreflang, route mapping, and switch behavior are implemented together. |
| Shared page behavior | `assets/main.js` | Owns navigation enhancement, service focus panels, PWA registration, Web Vitals events, form UI helpers, and chatbot sanitizer/hash utilities. |
| Footer | `assets/footer.js` | Injects shared footer links and legal navigation. |
| Chatbot runtime | `assets/gabo-io-chatbot.js` | The only production chatbot JavaScript. |
| Chatbot styles | `assets/gabo-io-chatbot.css` | The only production chatbot CSS. |
| Deployment headers | `_headers` | Source of truth for static-host security headers. |
| PWA cache | `service-worker.js` | Keep the precache list aligned with intended offline coverage. |
| Manifest/icon | `manifest.webmanifest`, `assets/icon.svg` | PWA install metadata. |
| Contact submit | `contact/tiny-ml.js`, `contact/secure-submit.js` | Canonical contact browser-side validation and submit flow. |
| Careers submit | `careers/tiny-ml.js`, `careers/secure-submit.js` | Canonical careers browser-side validation and submit flow. |

## Chatbot demo folder

`chatbot/gabo-io-chatbot.html` is a minimal demo loader that imports the production chatbot assets from `assets/`. The `chatbot/` directory must not contain duplicate runtime JS or CSS copies; keep chatbot runtime changes in `assets/gabo-io-chatbot.js` and `assets/gabo-io-chatbot.css`.

## Deployment notes

- Deploy the repository root as a static site so root files such as `_headers`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `service-worker.js`, and `offline.html` are served from the web root.
- `_headers` is the deployment security-header source of truth. Runtime meta-tag injection in `assets/main.js` is defense-in-depth only and must not replace deployed HTTP headers.
- `offline.html` is kept for service-worker fallback behavior but is intentionally excluded from `sitemap.xml`.
- `services.html` is the only Services index route. Do not create an alternate overview route or competing Services label.
- Form endpoints are public browser endpoints. Do not put secrets, private tokens, or internal service credentials in this repo.

## Validation checklist

Run these checks before opening a PR:

### Local links

```bash
python3 - <<'PY'
from pathlib import Path
import re, sys
errors=[]
htmls=list(Path('.').glob('*.html'))+list(Path('legal').glob('*.html'))+list(Path('services').glob('*.html'))+list(Path('chatbot').glob('*.html'))
for h in htmls:
    text=h.read_text(errors='ignore')
    for match in re.finditer(r'''(?:href|src)=["']([^"']+)["']''', text):
        url=match.group(1)
        if url.startswith(('http://','https://','mailto:','tel:','#')):
            continue
        target=url.split('#')[0].split('?')[0]
        if not target:
            continue
        resolved=(h.parent/target).resolve()
        try:
            rel=resolved.relative_to(Path.cwd())
        except ValueError:
            errors.append((str(h), url, 'outside-root'))
            continue
        if not Path(rel).exists():
            errors.append((str(h), url, str(rel)))
print('broken local refs:', len(errors))
for error in errors:
    print(error)
sys.exit(1 if errors else 0)
PY
```

### JavaScript syntax

```bash
for f in assets/*.js contact/*.js careers/*.js service-worker.js; do node --check "$f" || exit 1; done
```

### Duplicate files

```bash
python3 - <<'PY'
from pathlib import Path
import collections, hashlib, sys
files=[p for p in Path('.').rglob('*') if p.is_file() and '.git' not in p.parts]
groups=collections.defaultdict(list)
for path in files:
    groups[hashlib.sha256(path.read_bytes()).hexdigest()].append(str(path))
duplicates=[paths for paths in groups.values() if len(paths)>1]
for paths in duplicates:
    print('duplicate:', ', '.join(paths))
sys.exit(1 if duplicates else 0)
PY
```

### i18n keys

```bash
python3 - <<'PY'
from pathlib import Path
import re, sys
attrs=['data-i18n','data-i18n-content','data-i18n-aria-label','data-i18n-placeholder','data-i18n-focus-title','data-i18n-focus-text','data-i18n-focus-items']
html_keys=set()
for path in list(Path('.').glob('*.html'))+list(Path('legal').glob('*.html'))+list(Path('services').glob('*.html')):
    text=path.read_text(errors='ignore')
    for attr in attrs:
        html_keys.update(re.findall(attr + r'="([^"]+)"', text))
js=Path('assets/i18n.js').read_text(errors='ignore')
missing=sorted(key for key in html_keys if not re.search(r'\b' + re.escape(key) + r'\s*:', js))
print('missing i18n keys:', len(missing))
for key in missing:
    print(key)
sys.exit(1 if missing else 0)
PY
```

### Sitemap coverage

```bash
python3 - <<'PY'
from pathlib import Path
import re, sys
sitemap=Path('sitemap.xml').read_text()
urls=set(re.findall(r'<loc>https://www\.gabo\.services/([^<]*)</loc>', sitemap))
expected={'', 'about.html', 'careers.html', 'contact.html', 'services.html', 'services/logistics-operations.html', 'services/administrative-backoffice.html', 'services/customer-relations.html', 'services/it-support.html', 'legal/terms.html', 'legal/cookies.html', 'legal/privacy-gdpr.html'}
missing=sorted(expected-urls)
extra=sorted(urls-expected)
print('missing sitemap urls:', missing)
print('extra sitemap urls:', extra)
sys.exit(1 if missing or extra else 0)
PY
```

### Security headers

```bash
python3 - <<'PY'
from pathlib import Path
required=['Strict-Transport-Security','Content-Security-Policy','X-Content-Type-Options','X-Frame-Options','Referrer-Policy','Permissions-Policy']
headers=Path('_headers').read_text()
missing=[name for name in required if name not in headers]
print('missing headers:', missing)
raise SystemExit(1 if missing else 0)
PY
```

For deployed environments, also verify response headers directly with `curl -I https://www.gabo.services/`.

### PWA cache coverage

```bash
python3 - <<'PY'
from pathlib import Path
import re, sys
sw=Path('service-worker.js').read_text()
precache=set(re.findall(r'"([^"]+)"', sw.split('PRECACHE_URLS = [',1)[1].split('];',1)[0]))
required={'./','index.html','offline.html','services.html','contact.html','assets/styles.css','assets/main.js','assets/footer.js','assets/theme.js','assets/i18n.js','assets/gabo-io-chatbot.css','assets/gabo-io-chatbot.js','assets/icon.svg','manifest.webmanifest'}
missing=sorted(required-precache)
print('missing precache entries:', missing)
sys.exit(1 if missing else 0)
PY
```

If this check fails, either add the missing production shell assets to `service-worker.js` or update the checklist to match the intentionally narrower offline scope.
