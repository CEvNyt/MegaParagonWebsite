# Concept 2: multi-page website

This is the alternate information architecture for the Mega Paragon mockup. The home page leads with the full-bleed company video, headline, events, and announcements, while the supporting content is split into separate pages:

- `index.html` - landing page, company video, events, and announcements
- `about.html` - about us
- `hierarchy.html` - organizational hierarchy
- `join-us.html` - sales partner page
- `contact.html` - agent and partner contact page

The site uses the same dependency-free HTML, CSS, and JavaScript approach as the original concept. The supplied logo is bundled as `logo.png`. The portal login links currently point to the placeholder `/system/login` route.

The landing page uses the supplied MP4 as a muted, looping, autoplaying company film with custom play/pause and sound controls. The filename indicates H.265/HEVC encoding, which some browsers cannot decode; for production, provide an H.264 MP4 or WebM transcode.
