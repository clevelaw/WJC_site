

const commuteData = JSON.parse(document.getElementById("commute-data").value);

const toWorkCal = Array.from({length: 31}, (_, index) => ({key: index + 1, density: [], day_of: "" }));
const toHomeCal = Array.from({length: 31}, (_, index) => ({key: index + 1, density: [], day_of: "" }));


console.log(commuteData);
//move data into toXxxxCal for graphing in D3
for (let i = 0; i < commuteData.length; i++){
  const dayString = commuteData[i]["commute_date"];
  const tempDate = new Date(dayString);
  const temp = tempDate.getUTCDate() - 1;


  /*
  commute time with no traffic can change depending on route taken, maps will sometimes route
  longer if there is a large obstruction, total diff will make it look small if so
  commuteData[i]["to_home"]/60 - commuteData[i]["to_home_no_traffic"]/60

  const homeDiff = commuteData[i]["to_home"]/60 - commuteData[i]["to_home_no_traffic"]/60;
  var tempHomeArr = [commuteData[i]["ssm"]/3600,homeDiff];
  const workDiff = commuteData[i]["to_work"]/60 - commuteData[i]["to_work_no_traffic"]/60;
  var tempWorkArr = [commuteData[i]["ssm"]/3600,workDiff];
  */
  const homeDiff = commuteData[i]["to_home"]/60 - 16.05;
  var tempHomeArr = [commuteData[i]["ssm"]/3600,homeDiff];
  const workDiff = commuteData[i]["to_work"]/60 - 16.05;
  var tempWorkArr = [commuteData[i]["ssm"]/3600,workDiff];
  
  //when data is missing in the middle of the day, adds a 0 value to prevent weird interpolation on graph
  if (i < commuteData.length - 1) {
    if (commuteData[i]["ssm"] + 301 < commuteData[i + 1]["ssm"]) {
      tempWorkArr = [(commuteData[i + 1]["ssm"] - 1)/3600, 0];
      tempHomeArr = [(commuteData[i + 1]["ssm"] - 1)/3600, 0];
    } 
  }

  toHomeCal[temp]['density'].push(tempHomeArr);
  toHomeCal[temp]['day_of'] = commuteData[i]["day_of"];
  toWorkCal[temp]['density'].push(tempWorkArr);
  toWorkCal[temp]['day_of'] = commuteData[i]["day_of"];
};
  
//put a 0 point at the first datapoint on a line, otherwise graph filling can invert
for (let i = 0; i < toWorkCal.length || i < toHomeCal.length; i++) {
  if (i < toWorkCal.length && toWorkCal[i]['day_of'] !== "") {
    let flatline = [[toWorkCal[i]['density'][0][0] - 0.08333333333333333, 0]];
    toWorkCal[i]['density'] = flatline.concat(toWorkCal[i]['density']);
  }

  if (i < toHomeCal.length && toHomeCal[i]['day_of'] !== "") {
    let flatlineHome = [[toHomeCal[i]['density'][0][0] - 0.08333333333333333, 0]];
    toHomeCal[i]['density'] = flatlineHome.concat(toHomeCal[i]['density']);
  }
}

//0 value at the end to keep fill from going high
for (let i = 0; i < toWorkCal.length; i++) {
  //avoids filling in too much missing data
  if (toWorkCal[i]['density'].length > 100) { 
    toWorkCal[i]['density'].push([24, 0]);
    toHomeCal[i]['density'].push([24, 0]);
  }
}

console.log(toWorkCal);////////////////////////////////////////////////////////////////////////


// set the dimensions and margins of the graph
//original values {top: 60, right: 30, bottom: 20, left:110}
var margin = {top: 60, right: 25, bottom: 40, left:40},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Get the different categories and count them
var categories = Array.from({ length: 31 }, (_, i) => i + 1);
var n = categories.length

var color_table = {
      "Monday": "#e41a1c",
      "Tuesday": "#ff7f00",
      "Wednesday": "#CCBBBB",
      "Thursday": "#4daf4a",
      "Friday": "#377eb8",
      "Saturday": "#710193",
      "Sunday": "#000000"
};

// append the svg object to the body of the page
var toWorkSvg = d3.select("#toWorkViz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var toHomeSvg = d3
  .select("#toHomeViz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add X axis
var x = d3.scaleLinear()
  .domain([0, 24])
  .range([ 0, width]);

// Create a Y scale for densities
var y = d3.scaleLinear()
  .domain([0, 100])///////////////17.5
  .range([ height, 0]);

// Create the Y axis for names
var yName = d3.scaleBand()
  .domain(categories)
  .range([0, height])
  .paddingInner(1)


function createGraph(inSvg, inCal, inTitle){
	inSvg.append("g")
	  .attr("transform", "translate(0," + height + ")")
	  .call(d3.axisBottom(x));

	// Create the Y axis for names
	inSvg.append("g")
	  .call(d3.axisLeft(yName));

	inSvg.append("text")
		.attr("class", "x label")
		.attr("text-anchor", "middle")
		.attr("x", width/2)
		.attr("y", height+35)
		.text("Time of day");

	inSvg.append("text")
		.attr("text-anchor", "end")
		.attr("transform", "rotate(-90)")
		.attr("y", -margin.left+15)
		.attr("x", -margin.top*2)
		.text("Day")

	inSvg.selectAll("areas")
	  .data(inCal)
	  .enter()
	  .append("path")
		.attr("transform", function(inCal){return("translate(0," + (yName(inCal.key)-height) +")" )})
		//.datum(function(cal){return(cal.density)})
		//.attr("fill", function(cal) {return color(cal); })
		.attr("fill", function(inCal){
		  grp = inCal.day_of;
		  return color_table[grp]
		})
		.datum(function(inCal){return(inCal.density)}) //data is transformed after this
		.attr("opacity", .8)
		.attr("stroke", "#000")
		.attr("stroke-width", 1.3)
		.attr("d",  d3.line()
			.curve(d3.curveBasis)
			.x(function(getX) { return x(getX[0]); })
			.y(function(getY) { return y(getY[1]); })
		);

	inSvg.append("text")
			.attr("x", width/2)      
			.attr("y", -10 - (margin.top /2))
			.attr("text-anchor", "middle")  
			.style("font-size", "16px") 
			.style("text-decoration", "underline")  
			.text(inTitle);
};

/* Update graph when multiSelect option changes
d3.select("#multiSelect").on("change", function() {
    const selectedDays = Array.from(this.selectedOptions, option => option.value);
    if (selectedDays.length === 0) {
        selectedDays.push("all"); // Default to "All Days" if nothing selected
    }
    updateToHome(selectedDays);
    updateToWork(selectedDays);
});
*/
function updateGraph(selectedDays, changeSvg, cal) {
    changeSvg.selectAll("path").remove();
    changeSvg.selectAll("g").remove();

    changeSvg.selectAll("areas")
      .data(cal.filter(item => selectedDays.includes("all") || selectedDays.includes(item.day_of)))
      .enter()
      .append("path")
        .attr("transform", function(cal) {
            return ("translate(0," + (yName(cal.key) - height) + ")");
        })
        .attr("fill", function(cal) {
            grp = cal.day_of;
            return color_table[grp];
        })
        .datum(function(cal) {
            return (cal.density);
        })
        .attr("opacity", .8)
        .attr("stroke", "#000")
        .attr("stroke-width", 1.3)
        .attr("d", d3.line()
            .curve(d3.curveBasis) //rounded option
            //.curve(d3.curveStepBefore) // square option
            .x(function(getX) { return x(getX[0]); })
            .y(function(getY) { return y(getY[1]); })
        );

    changeSvg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    changeSvg.append("g")
      .call(d3.axisLeft(yName));
}

createGraph(toWorkSvg, toWorkCal, "Commute to Work");
createGraph(toHomeSvg, toHomeCal, "Commute to Home");

d3.selectAll(".chkDay").on("change", function() {
    const selectedDays = d3.selectAll(".chkDay:checked").nodes().map(node => node.value);
    updateGraph(selectedDays, toWorkSvg, toWorkCal);
    updateGraph(selectedDays, toHomeSvg, toHomeCal);
});




var x1Input = document.getElementById("homeX1");
var x2Input = document.getElementById("homex2");
var drawLineButton = document.getElementById("drawLineButton");

// Add an event listener to the button
drawLineButton.addEventListener("click", function() {
    // Get user input values for x1 and x2
    var userX1 = +x1Input.value; // Convert to number
    var userX2 = +x2Input.value; // Convert to number

    // Remove any existing lines
    toWorkSvg.selectAll("line").remove();
    toHomeSvg.selectAll("line").remove();

    // Draw the new line based on user input
    toWorkSvg.append("line")
        .attr("x1", x(userX1))
        .attr("y1", 0)
        .attr("x2", x(userX1))
        .attr("y2", height)
        .style("stroke-width", 1.5)
        .style("stroke", "black")
        .style("fill", "none");

    toHomeSvg.append("line")
        .attr("x1", x(userX1))
        .attr("y1", 0)
        .attr("x2", x(userX1))
        .attr("y2", height)
        .style("stroke-width", 1.5)
        .style("stroke", "black")
        .style("fill", "none");

    toWorkSvg.append("line")
        .attr("x1", x(userX2))
        .attr("y1", 0)
        .attr("x2", x(userX2))
        .attr("y2", height)
        .style("stroke-width", 1.5)
        .style("stroke", "black")
        .style("fill", "none");

    toHomeSvg.append("line")
        .attr("x1", x(userX2))
        .attr("y1", 0)
        .attr("x2", x(userX2))
        .attr("y2", height)
        .style("stroke-width", 1.5)
        .style("stroke", "black")
        .style("fill", "none");
});




//attemping gradiant color
//  .attr("fill", "#69b3a2")
//const dayColors = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const dayColors = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const color = d3.scaleOrdinal()
  .domain(dayColors)
  .range(['#e41a1c','#ff7f00','#CCBBBB','#4daf4a','#377eb8','#710193','#000000'])

//d3 legend for ridgeline plot
const legendSvg = d3.select("#d3Legend")
const size = 15
legendSvg.selectAll("mydots")
  .data(dayColors)
  .enter()
  .append("rect")
    .attr("x", function(d,i){ return 40 + 80 * i})
    .attr("y", 10)
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d){ return color(d)})

legendSvg.selectAll("mylabels")
  .data(dayColors)
  .enter()
  .append("text")
    .attr("y", 40)
    .attr("x", function(d,i){ return 20 + 80 * i})
    .style("fill", function(d){ return color(d)})
    .text(function(d){ return d})
    .attr("text-anchor", "right")
    .style("alignment-baseline", "middle")



var dayInput = document.getElementById("trafficDay")
var leaveTimeInput = document.getElementById("leaveTime")
var timeAtWorkInput = document.getElementById("timeAtWork")
var altLeaveInput = document.getElementById("altLeaveTime")
var calcButton = document.getElementById("calcDiffButton")

RENAMETHSI.addEventListener('click', () => {
  const key = parseInt(dayInput.value);
  const dayEntry = toWorkCal.find(item => item.key === key);

  if (dayEntry) {
    const toWorkComm = dayEntry.density[leaveTimeInput * 12][1];
    const toHomeComm = dayEntry.density[(leaveTimeInput+timeAtWorkInput) * 12][1];

    const toWorkCommAlt = dayEntry.density[(leaveTimeInput+altLeaveInput) * 12][1];
    const toHomeComm2Alt = dayEntry.density[(leaveTimeInput+altLeaveInput+timeAtWorkInput) * 12][1];


    densityResult.textContent = `Density at index 0 for ${dayEntry.day_of}: ${densityAtIndex0}`;
  } else {
    densityResult.textContent = 'No information found for the provided key.';
  }
});


const tDay = document.getElementById("trafficDay");
const lTime = document.getElementById("leaveTime");
const altTime = document.getElementById("altLeaveTime");
const tWork = document.getElementById("timeAtWork");


/*const calcButton = document.getElementById('calcButton');
const keyInput = document.getElementById('keyInput');
const densityResult = document.getElementById('densityResult');

calcButton.addEventListener('click', () => {
  const key = parseInt(keyInput.value);
  const dayEntry = toWorkCal.find(item => item.key === key);

  if (dayEntry) {
    const densityAtIndex0 = dayEntry.density[0];
    densityResult.textContent = `Density at index 0 for ${dayEntry.day_of}: ${densityAtIndex0}`;
  } else {
    densityResult.textContent = 'No information found for the provided key.';
  }
});
*/
