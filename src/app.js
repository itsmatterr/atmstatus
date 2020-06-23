const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const pageURL = 'https://www.atm.it/it/Pagine/default.aspx';

// Load web page data
const fetchData = async () => {
  const result = await axios.get(pageURL);
  return cheerio.load(result.data);
};

const getResults = async () => {
  const $ = await fetchData();

  // Fetch lines status
  const status = [];
  $('.StatusLinee_StatoScritta').each(function (i) {
    status[i] = $(this).text().trim();
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

  // Create an array of objects containing the final data that has to be returned
  const result = [];
  for (let i = 0; i < status.length; i++) {
    const obj = {};
    obj.line = lines[i];
    obj.direction = directions[i];
    obj.status = status[i];
    result.push(obj);
  }

  console.log(result);
  return result;
};

app.get('/', async (req, res) => {
  const status = await getResults();
  res.json(status);
});

app.listen(3000, () => {
  console.log('App listening on port 3000');
});
