# Security rules for this website (read before changing anything)

1. **Static site only**: no forms, logins, cookies, analytics or trackers.
2. **No inline scripts.** All JavaScript lives in /js and is served from this site; the Content-Security-Policy meta tag on every page only allows scripts from 'self'. New pages must include the same CSP and Referrer-Policy tags.
3. **Never insert untrusted text as HTML.** Only static content goes into innerHTML; anything from the URL is looked up against a fixed list, never inserted.
4. **No third-party scripts.** Self-host libraries (like GSAP) in /js. Fonts from Google Fonts are the only outside resource, and the privacy policy says so.
5. **No secrets** in this public repo, ever.
6. **Keep privacy policies and terms in step** with the apps; update the date when they change.
