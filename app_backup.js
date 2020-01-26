function loadCSV() {

  return new Promise(function (resolve, reject) {


    d3.csv("formResp.csv", function (data) {

      resolve(data)

    });


  })
}


function main(personsData) {


  aliasList = []
  aliasTotVal = []
  aliasMean = []


  //Creating new list for use in calculations

  for (i = 0; i < personsData.length; i++) {

    alias = personsData[i]["Alias"];

    aliasList.push({
      [alias]: [
        personsData[i]["How would you rate your Information Visualization skills?"],
        personsData[i]["How would you rate your statistical skills?"],
        personsData[i]["How would you rate your mathematics skills?"],
        personsData[i]["How would you rate your drawing and artistic skills?"],
        personsData[i]["How would you rate your computer usage skills?"],
        personsData[i]["How would you rate your programming skills?"],
        personsData[i]["How would you rate your computer graphics programming skills?"],
        personsData[i]["How would you rate your user experience evaluation skills?"],
        personsData[i]["How would you rate your collaboration skills?"],
        personsData[i]["How would you rate your code repository skills?"]

      ]
    })

    value = summarizeList(aliasList[i][alias]);
    aliasTotVal.push({ [alias]: value });

    mean = averageList(value);
    aliasMean.push({ [alias]: mean })

  }

  console.log(aliasList)
  console.log(aliasTotVal)
  console.log(aliasMean)
  console.log(aliasTotVal[0]["Hannah Abbott "])

  //###DRAW_SVG###//


  // Setup svg using Bostock's margin convention

  var margin = { top: 20, right: 160, bottom: 120, left: 30 };

  var width = 2000 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

  var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  /* Data in strings like it would be if imported from a csv */

  /*
  var data = [
    { year: "2006", redDelicious: "10", mcintosh: "15", oranges: "9", pears: "6" },
    { year: "2007", redDelicious: "12", mcintosh: "18", oranges: "9", pears: "4" },
    { year: "2008", redDelicious: "05", mcintosh: "20", oranges: "8", pears: "2" },
    { year: "2009", redDelicious: "01", mcintosh: "15", oranges: "5", pears: "4" },
    { year: "2010", redDelicious: "02", mcintosh: "10", oranges: "4", pears: "2" },
    { year: "2011", redDelicious: "03", mcintosh: "12", oranges: "6", pears: "3" },
    { year: "2012", redDelicious: "04", mcintosh: "15", oranges: "8", pears: "1" },
    { year: "2013", redDelicious: "06", mcintosh: "11", oranges: "9", pears: "4" },
    { year: "2014", redDelicious: "10", mcintosh: "13", oranges: "9", pears: "5" },
    { year: "2015", redDelicious: "16", mcintosh: "19", oranges: "6", pears: "9" },
    { year: "2016", redDelicious: "19", mcintosh: "17", oranges: "5", pears: "7" },
  ];
*/
  
  //aliasTotVal[0]["Hannah Abbott "]

  var data = [];

  for (i = 0; i < aliasList.length; i++) {
    data.push(
      {name: personsData[i]["Alias"], TotalValue: ""+aliasTotVal[i][personsData[i]["Alias"]], MeanValue: ""+aliasMean[i][personsData[i]["Alias"]], oranges: "9", pears: "6"}
    )
  }

  console.log(data)

 

  //var parse = d3.time.format("%Y").parse;


  // Transpose the data into layers
  var dataset = d3.layout.stack()(["TotalValue", "MeanValue"].map(function (person) {
    return data.map(function (d) {
      return { x: d.name, y: +d[person] };
      //return { x: parse(d.year), y: +d[fruit] };
    });
  }));


  // Set x, y and colors
  var x = d3.scale.ordinal()
    .domain(dataset[0].map(function (d) { return d.x; }))
    .rangeRoundBands([10, width - 10], 0.02);

  var y = d3.scale.linear()
    .domain([0, d3.max(dataset, function (d) { return d3.max(d, function (d) { return d.y0 + d.y; }); })])
    .range([height, 0]);

  var colors = ["b33040", "#d25c4d"];


  // Define and draw axes
  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5)
    .tickSize(-width, 0, 0)
    .tickFormat(function (d) { return d });

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    
    //.tickFormat(d3.time.format("%Y"));

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis).selectAll("text")	
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function(d) {
        return "rotate(-65)" 
        });


  // Create groups for each series, rects for each segment 
  var groups = svg.selectAll("g.cost")
    .data(dataset)
    .enter().append("g")
    .attr("class", "cost")
    .style("fill", function (d, i) { return colors[i]; });

  var rect = groups.selectAll("rect")
    .data(function (d) { return d; })
    .enter()
    .append("rect")
    .attr("x", function (d) { return x(d.x); })
    //.attr("y", function (d) { console.log(d.y0); })
    .attr("y", function (d) { return y(d.y0 + d.y); })
    .attr("height", function (d) { return y(d.y0) - y(d.y0 + d.y); })
    .attr("width", x.rangeBand())
    .on("mouseover", function () { tooltip.style("display", null); })
    //.on("mouseout", function () { tooltip.style("display", "none"); })
    .on("mousemove", function (d) {
      tooltip.select("text").text(d.y);
    });


  // Draw legend
  var legend = svg.selectAll(".legend")
    .data(colors)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) { return "translate(30," + i * 19 + ")"; });

  legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function (d, i) { return colors.slice().reverse()[i]; });

  legend.append("text")
    .attr("x", width + 5)
    .attr("y", 9)
    .attr("dy", ".35em")
    //.style("text-anchor", "start")
    .style("writing-mode", "vertical-rl")
    .text(function (d, i) {
      switch (i) {
        case 0: return "Mean Score";
        case 1: return "Total Score";
      }
    });


  // Prep the tooltip bits, initial display is hidden
  var tooltip = svg.append("g")
    .attr("class", "tooltip")
    .style("display", "none");

  tooltip.append("rect")
    .attr("width", 300)
    .attr("height", 200)
    .attr("fill", "black")
    .style("opacity", 1);

  tooltip.append("text")
    .attr("x", 15)
    .attr("dy", "1.2em")
    //.style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");


}

function summarizeList(list) {

  sum = list.reduce((pv, cv) => parseInt(pv) + parseInt(cv), 0);
  return sum

}


function averageList(sum) {
  //Calculate mean-ish value
  //sum of all scores divided by number of categories

  return sum / 10
}



function mount() {

  loadCSV().then(function (data) { main(data) })
}

mount()




