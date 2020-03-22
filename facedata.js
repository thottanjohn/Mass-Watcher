const fs = require('fs');
var express = require('express');
var app = express();
app.get('/', (req, res) => {
        var data = JSON.parse(fs.readFileSync( 'FINAL/src/4forces.json'));     
        res.render("index", {data:data});
    });
app.listen(3000, () => console.log(`Server is up on port:3001`));