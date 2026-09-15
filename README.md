# MoVT project website

**MoVT: Video-Augmented Motion Tokenizer for Text-to-Motion Generation**  
**ACM MM 2026 · Oral**

Project page: https://x-motion.github.io/MoVT-website/  
Code release: https://github.com/X-mOtion/MoVT — Coming soon.

This repository contains the prebuilt public website in `docs/`. GitHub Pages
publishes the `main` branch, `/docs` directory. The page includes the authors,
affiliations, abstract, teaser, pipeline, paper-reported results, and the existing
motion demonstrations. The main PDF is the supplied camera-ready paper.

The page's design and demonstrations are unchanged from the approved desktop
version. The paper download and BibTeX use the publication-ready metadata.

No original manuscript source archive, review documents, training code,
model weights, or supplementary-material PDF is included in this repository.
Only the inspected public files in the deployment allowlist may be uploaded.

## Local preview

```bash
python3 -m http.server 8000 --directory docs
```

Open `http://localhost:8000/` in a browser.

## Attribution

The motion viewer uses Three.js. See `THIRD_PARTY_NOTICES.txt`.
