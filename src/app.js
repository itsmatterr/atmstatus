var express = require('express');
var app = express();

const cheerio = require("cheerio");
const axios = require("axios");
const pageURL = "https://www.atm.it/it/Pagine/default.aspx";

app.get('/', async function (req, res) {
    const status = await getResults();
    res.json(status);
});

app.listen(3000, function () {
  console.log('App listening on port 3000');
});

//Load web page data
const fetchData = async () => {
    const result = await axios.get(pageURL);
    return cheerio.load(result.data);
};

const getResults = async () => {
    const $ = await fetchData();
  
    //Fetch lines status
    const status = [];
    $(".StatusLinee_StatoScritta").each(function(i, elem) {
        status[i] = $(this).text().trim();
    });

    //Fetch lines directions
    const directions = [];
    $(".StatusLinee_DirezioneScritta").each(function(i, elem) {
        directions[i] = $(this).text().trim();
    });

    //Fetch lines names and use the rowspan attribute (half) to distinguish each destination by line
    const linesNames = [];
    const linesCount = [];
    $(".StatusLinee_Linea").each(function(i, elem) {
        linesCount[i] = $(this).attr("rowspan")/2;
        linesNames[i] = $(this).find("img").attr("title");
    });

    //Create an array containing all the lines names
    var lines = [];
    for(var i = 0; i < linesNames.length; i++) {
        lines = lines.concat(Array(linesCount[i]).fill(linesNames[i]));
    }

    //Create an array of objects containing the final data that has to be returned
    var result = new Array();
    for(var i = 0; i < status.length; i++) {
        var obj = new Object();
        obj.line = lines[i];
        obj.direction = directions[i];
        obj.status = status[i];
        result.push(obj);
    }

    console.log(result);
    return result;
};