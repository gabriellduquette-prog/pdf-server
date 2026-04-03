const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

// 🔍 Route test (important pour vérifier Render)
app.get('/', (req, res) => {
  res.send('API PDF en ligne 🚀');
});

// 📄 Route PDF
app.post('/pdf', async (req, res) => {
  try {
    const data = req.body;

    // HTML simple (tu pourras améliorer après)
    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial;
              padding: 40px;
              color: #1f2937;
            }
            h1 {
              color: #2b6cb0;
            }
          </style>
        </head>
        <body>
          <h1>Facture ${data.invoice_number}</h1>
          <p>Total: ${data.total} $</p>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=facture.pdf');

    res.send(pdf);

  } catch (error) {
    console.error('Erreur PDF:', error);
    res.status(500).send('Erreur génération PDF');
  }
});

// 🔥 PORT dynamique pour Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});