const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const pageURL = 'https://www.atm.it/it/Pagine/default.aspx';

// Scrape data that has been read from server
const scrapeData = function ($) {
  // Fetch lines status
  const status = [];
  $('.StatusLinee_StatoScritta').each(function (i) {
    const tmp = $(this).text().trim();
    if (tmp === 'Regolare') status[i] = 'Green';
    else if (tmp === 'Rallentata') status[i] = 'Yellow';
    else status[i] = 'Red';
  });

  // Fetch lines directions
  const directions = [];
  $('.StatusLinee_DirezioneScritta').each(function (i) {
    directions[i] = $(this).text().trim()
      .toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');
  });

  // Fetch lines names and use the rowspan attribute (half) to distinguish each destination by line
  const linesNames = [];
  const linesCount = [];
  $('.StatusLinee_Linea').each(function (i) {
    linesCount[i] = $(this).attr('rowspan') / 2;
    linesNames[i] = $(this).find('img').attr('title');
  });

  // Create an array containing all the lines names
  let lines = [];
  for (let i = 0; i < linesNames.length; i++) {
    lines = lines.concat(Array(linesCount[i]).fill(linesNames[i]));
  }

  // Create the final json response
  const result = { data: { lines: [] } };
  const arr = [];
  for (let i = 0; i < status.length; i++) {
    const obj = {};
    obj.line = lines[i];
    obj.direction = directions[i];
    obj.status = status[i];
    arr.push(obj);
  }
  result.data.lines = arr;

  console.log(JSON.stringify(result, null, 2));
  return result;
};

// Load the web page
const getResults = async () => {
  const res = await axios.get(pageURL)
    .then((result) => cheerio.load(result.data))
    .then(($) => scrapeData($))
    .catch(() => {
      console.log('Failed to connect.');
      return { error: 'Failed to connect' };
    });
  return res;
};

app.get('/', async (req, res) => {
  const status = await getResults();
  res.json(status);
});

app.listen(3000, () => {
  console.log('App listening on port 3000');
});
