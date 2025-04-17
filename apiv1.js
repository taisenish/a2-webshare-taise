var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');
const { parse } = require('node-html-parser');

/* GET API home */
router.get('/', function(req, res, next) {
  res.json({ message: 'API v1 is running' });
});

/* GET URL preview */
router.get('/urls/preview', async function(req, res, next) {
  try {
    // Get URL from query parameter
    const url = req.query.url;
    
    if (!url) {
      return res.status(400).send('URL parameter is required');
    }
    
    // Fetch the URL content
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
    
    // Get HTML content
    const html = await response.text();
    
    // Parse HTML
    const root = parse(html);
    
    // Find Open Graph information
    let ogUrl = getMetaContent(root, 'og:url') || url;
    let ogTitle = getMetaContent(root, 'og:title');
    let ogImage = getMetaContent(root, 'og:image');
    let ogDescription = getMetaContent(root, 'og:description');
    
    // Fallbacks for missing information
    if (!ogTitle) {
      const titleTag = root.querySelector('title');
      ogTitle = titleTag ? titleTag.text : url;
    }
    
    // Create HTML for preview box
    let previewHtml = `<div style="max-width: 300px; border: solid 1px; padding: 3px; text-align: center;">`;
    previewHtml += `<a href="${ogUrl}">`;
    previewHtml += `<p><strong>${ogTitle}</strong></p>`;
    
    if (ogImage) {
      previewHtml += `<img src="${ogImage}" style="max-height: 200px; max-width: 270px;">`;
    }
    
    previewHtml += `</a>`;
    
    if (ogDescription) {
      previewHtml += `<p>${ogDescription}</p>`;
    }
    
    previewHtml += `</div>`;
    
    res.send(previewHtml);
    
  } catch (error) {
    // Error handling - send error message
    res.status(500).send(`<div class="error">Error processing URL: ${error.message}</div>`);
  }
});

// Helper function to get meta content
function getMetaContent(root, property) {
  const metaTag = root.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
  return metaTag ? metaTag.getAttribute('content') : null;
}

module.exports = router;