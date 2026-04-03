const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => {
  res.send('API PDF en ligne');
});

app.post('/pdf', async (req, res) => {
  let browser;

  try {
    const data = req.body || {};

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #1f2937;
            }
            h1 {
              color: #2b6cb0;
            }
          </style>
        </head>
        <body>
          <h1>Facture ${data.invoice_number || 'SANS-NUMERO'}</h1>
          <p>Total: ${data.total ?? 0} $</p>
        </body>
      </html>
    `;

    console.log('Début génération PDF');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('Browser lancé');

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    console.log('HTML chargé');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    console.log('PDF généré');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=facture.pdf');
    res.send(pdf);
  } catch (error) {
    console.error('Erreur PDF complète:', error);
    res.status(500).json({
      error: error?.message || 'Erreur inconnue',
      stack: error?.stack || null
    });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});