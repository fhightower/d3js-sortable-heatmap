"use strict";

var dataset = [ { "2003": "1", "2004": "1", "2005": "1", "2006": "1", "2007": "1", "2008": "1", "2009": "1", "Country Name": "USA" },
{ "2003": "2", "2004": "2", "2005": "2", "2006": "2", "2007": "3", "2008": "4", "2009": "6", "Country Name": "Canada" },
{ "2003": "3", "2004": "3", "2005": "3", "2006": "3", "2007": "2", "2008": "3", "2009": "3", "Country Name": "Italy" },
{ "2003": "4", "2004": "4", "2005": "4", "2006": "4", "2007": "4", "2008": "2", "2009": "2", "Country Name": "France" },
{ "2003": "5", "2004": "6", "2005": "6", "2006": "6", "2007": "6", "2008": "6", "2009": "7", "Country Name": "Ireland" },
{ "2003": "6", "2004": "5", "2005": "5", "2006": "5", "2007": "5", "2008": "5", "2009": "4", "Country Name": "Germany" }];

var years = d3.keys(dataset[0]).filter(function(key) {
    return key != "Country Name";
  });

console.log("years: ", years);

var empty={};
var output=[];
for(var i = 0; i < years.length; i++){
    empty = {};
    empty[years[i]] = dataset.sort(function (a,b) {return a[years[i]]-b[years[i]];}).map(function (d) {return d["Country Name"];});
    output.push(empty);
}

console.log("output", output);

var colSortOrder={};
for (var i=0; i<=output.length; i++) {
    var row = output[i];

    for (var yr in row) {
        colSortOrder[yr] = colSortOrder[yr] || {};
        colSortOrder[yr] = row[yr];
    }
}

console.log("colSortOrder: ", colSortOrder);

var rowSortOrder={};
for (var i=0; i<dataset.length; i++) {
    var countryData = dataset[i];

    var yearsSorted = Object.keys(countryData).sort(function(a,b){
        return countryData[a]-countryData[b];
    })

    // remove the "Country Name" value
    yearsSorted.pop();
    rowSortOrder[dataset[i]['Country Name']] = yearsSorted.reverse();
}

console.log("rowSortOrder: ", rowSortOrder);

var data = [];
dataset.sort(function (a,b) {
    return (a[years[0]]-b[years[0]]);
})

dataset.forEach(function(d){
    for (var i = 0; i < years.length; i++){
        data.push({"location": i, "year": years[i], "Country": d["Country Name"], "value": d[years[i]]});
    }
});

console.log("data", data);

var cell = {size: 20, width: 30, height: 20, border: 3}
var margin = {top: 250, right: 10, bottom: 10, left: 300},
height = 4800,
width = 1400;

var color = d3.scale.quantize()
    .domain([0, 6])
    .range(d3.range(9).map(function(d) { return "q" + d + "-11"; }));

var grid = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var cells = grid.append("g").attr("class", "grid_cells").selectAll("rect")
    .data(data)
    .enter().append("svg:rect")
    .attr("class", function(d){ return color(d.value); })
    .attr("x", function(d) { return (d.location)*cell.width ; })
    .attr("y", function(d) { return ( colSortOrder[years[0]].indexOf(d.Country))*cell.height; })
    .attr("width", cell.width - cell.border)
    .attr("height", cell.height- cell.border)
    .on('mouseover', function(d) {
        d3.select(this).style('fill', 'white');
        highlightLabels(d);
    })
    .on('mouseout', function(d) {
        d3.select(this).style('fill', '');
        unhighlightLabels(d);
    })
    .on('click', function() {
        console.log(d3.select(this));
    })
    .style("stroke", '#555');

function highlightLabels(event) {
    var rowNumber = 0;
    var rows = d3.selectAll(".row_label")[0];

    for (var i = rows.length - 1; i >= 0; i--) {
        if (rows[i].__data__ == event.Country) {
            d3.select(rows[i])
                .style("font-weight", "bold");

            rowNumber = i;
        }
    }

    var cols = d3.selectAll(".col_label")[0];

    for (var i = cols.length - 1; i >= 0; i--) {
        if (cols[i].__data__ == event.year) {
            d3.select(cols[i])
                .style("font-weight", "bold");
        }
    }

    var currCellLabelIndex = (rowNumber * years.length) + event.location;
    var cell_labels = d3.selectAll(".cell_label")[0];

    d3.select(cell_labels[currCellLabelIndex])
        .style("font-size", "16px")
        .style("font-weight", "bold");
}

function unhighlightLabels(event) {
    d3.selectAll(".row_label")
        .style("font-weight", "");

    d3.selectAll(".col_label")
        .style("font-weight", "");

     d3.selectAll(".cell_label")
        .style("font-size", "")
        .style("font-weight", "");
}

var celltext = grid.append("g").attr("class", "cell_labels").selectAll(".cell_label")
    .data(data)
    .enter().append("svg:text")
    .attr("x", function(d) { return (d.location)*cell.width + (cell.width-cell.border)/2  ;})
    .attr("y", function(d) { return (/*countryOrder*/colSortOrder[years[0]].indexOf(d.Country))*cell.height + (cell.height-cell.border)/2; })
    .attr("text-anchor","middle")
    .attr("dy",".35em")
    .attr("class", "cell_label")
    .text(function(d) { if (d.value == 0) { return ""; } else { return d.value; }} );

var rowtext = grid.append("g").attr("class", "row_labels").selectAll(".row_label")
    .data(colSortOrder[years[0]])
    .enter().append("svg:text")
    .attr("x", -6)
    .attr("y", function(d, i) { return (i*cell.height) + (cell.height-cell.border)/2; })
    .attr("class", "row_label")
    .text(function (d){return d;})
    .attr('dy', '.25em')
    .attr('text-anchor', 'end')
    .on("mouseover", function(d) { highlightRow(d); })
    .on("mouseout", function(d) { unhighlightRow(); })
    .on("click", function(d) { updateRow(d); });

function highlightRow(country) {
    grid.selectAll(".cell_label")
        .attr("font-weight", function(d) { if (d.Country == country){ return "bold"; } else { return ""; }})
        .style("font-size", function(d) { if (d.Country == country){ return "15px"; } else { return "12px"; }});
}

function unhighlightRow() {
    grid.selectAll(".cell_label")
        .attr("font-weight", function(d) { return ""; })
        .style("font-size", "12px");
}

function updateRow(country) {
    console.log("updating row", country);

    grid.selectAll('rect')
        .transition()
        .duration(2500)
        .attr("x", function(d) { return rowSortOrder[country].indexOf(d.year) * cell.width; });

    grid.selectAll(".cell_label")
        .transition()
        .duration(2500)
        .attr("x", function(d) { return rowSortOrder[country].indexOf(d.year)*cell.width + (cell.width-cell.border)/2; });

    d3.selectAll(".col_label")
        .data(rowSortOrder[country])
        .text(function (d){ return d; })
        .attr("x", function(d, i) { return (i*cell.width) + (cell.width-cell.border)/2; })
        .attr("y", 10);

    d3.selectAll(".col_label").attr("fill", "black").style("font-size", 12);
}

var coltext = grid.append("g").attr("class", "col_labels").selectAll(".col_label")
    .data(years)
     .enter().append("svg:text")
    .attr("x", function(d, i) { return (i*cell.width) + (cell.width-cell.border)/2; })
    .attr("y", 10)
    .attr("class", "col_label")
    .attr("id", function (d) { return "col_" + d + " ";})
    .text(function (d){return d;})
    .attr('dx', '1.5em')
    .attr('transform', function (d,i) {return "rotate(-75," + ((i*cell.width) + (cell.width-cell.border)/2) + ", 10)";})
    .on("mouseover", function(d) { highlightColumn(d); })
    .on("mouseout", function(d) { unhighlightColumn(d); })
    .on("click", function(d) { updateCol(d); });

function highlightColumn(year) {
    grid.selectAll(".cell_label")
        .attr("font-weight", function(d) { if (d.year == year){ return "bold"; } else { return ""; }})
        .style("font-size", function(d) { if (d.year == year){ return "15px"; } else { return "12px"; }});
}

function unhighlightColumn(year) {
    grid.selectAll(".cell_label")
        .attr("font-weight", function(d) { return ""; })
        .style("font-size", "12px");
}

function updateCol(year) {
    console.log("Updating column", year);

    grid.selectAll('rect')
        .transition()
        .duration(2500)
        .attr("y", function(d) { return (colSortOrder[year].indexOf(d.Country))*cell.height; });

    grid.selectAll(".cell_label")
        .transition()
        .duration(2500)
        .attr("y", function(d) { return (colSortOrder[year].indexOf(d.Country))*cell.height + (cell.height-cell.border)/2; });

    d3.selectAll(".row_label")
        .data(colSortOrder[year])
        .text(function (d){ return d; })
        .attr("y", function(d, i) { return (i*cell.height) + (cell.height-cell.border)/2; });
}
