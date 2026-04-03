const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

app.post('/pdf', async (req, res) => {
  const data = req.body;

  const html = `
    <html>
      <body>
        <h1>Facture ${data.invoice_number}</h1>
        <p>Total: ${data.total} $</p>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
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
  res.send(pdf);
});

app.listen(3000, () => console.log('Server running'));