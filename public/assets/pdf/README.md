# PDF Storage Directory

Place your research paper PDF files in this directory.

## Instructions

1. Copy your PDF files here
2. Update `data/papers.json` with the correct paths
3. Make sure the `pdfPath` in JSON matches the filename

## Example

If you have a file: `assets/pdf/deep-learning-2024.pdf`

In `data/papers.json`:
```json
{
  "id": "paper_1",
  "title": "Deep Learning Survey",
  "pdfPath": "assets/pdf/deep-learning-2024.pdf",
  ...
}
```

## Notes

- PDF.js supports most standard PDF files
- Large PDFs (>50MB) may load slowly
- Annotations are stored separately in localStorage
- Original PDFs are never modified

## Sample PDFs

For testing, you can use:
- ArXiv papers: https://arxiv.org/
- Research papers from your institution
- Any standard PDF document

---

*This directory is for storing PDF files only.*
