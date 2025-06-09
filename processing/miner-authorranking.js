const fs = require('fs');
const path = require('path');


const dataDir = path.join(__dirname, 'data');
function convertDownloads(downloadStr) {
    let num = parseFloat(downloadStr);
    if (downloadStr.includes("K")) num *= 1000;
    else if (downloadStr.includes("M")) num *= 1000000;
    else if (downloadStr.includes("B")) num *= 1000000000;
    return Math.round(num); // Ensures a whole number output
}

function processContent(output, content, filename) {
    const entries = content.split(/\n\s*\n/).map(entry => entry.trim());

    if (entries.length % 2 != 0) {
        throw "Unexpected entries length for file " + filename;
    }

    for (var i = 0; i < entries.length; i += 2) {
        var header = entries[i].split(/\n/).map(entry => entry.trim());
        var description = entries[i+1];


        if (header.length != 6 && header.length != 5) { //Length == 5 means never updated
            throw "Unexpected header length for file " + filename + " got " + header.length + " in " + header;
        }

        var name = header[0];
        var author = header[2];
        var downloadCount = convertDownloads(header[3].split(" ")[0]);
        
        if (!output[author]) {
            output[author] = {
                author,
                downloads: 0,
                mods: {},
            };
        }
        var mods = output[author].mods;
        mods[name] = true;
        output[author] = {
            author: output[author].author,
            downloads: output[author].downloads + downloadCount,
            mods
        };
    }
    return output;
}

function jsonToTable(jsonArray) {
    if (!Array.isArray(jsonArray)) {
        jsonArray = Object.values(jsonArray);
    }

    const headers = Object.keys(jsonArray[0]);

    const rows = jsonArray.map(obj => headers.map(key => obj[key] ?? "").join("\t"));

    return [headers.join("\t"), ...rows].join("\n");
}

fs.readdir(dataDir, (err, files) => {
    if (err) {  
        console.error("Error reading directory:", err);
        return;
    }

    let output = {}; 

    files.forEach(file => {
        if (file.endsWith('.txt')) {
            const filePath = path.join(dataDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            output = processContent(output, content, file);
        }
    });

    for (var authorName in output) {
        output[authorName].mods = Object.keys(output[authorName].mods).length;
    }
    let tableout = jsonToTable(output);
    
    const outPath = path.join(__dirname, 'out.txt');
    fs.writeFileSync(outPath, tableout, 'utf-8');
    console.log("Output saved to out.txt");
});