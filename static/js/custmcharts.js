$(function () {
  histChart();
  bookChart();
   
  function histChart() {
    //  alert('histchart');

    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 20, bottom: 30, left: 60 },
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
      .range([0, width])
      .padding(0.6);
    var y = d3.scaleLinear()
      .range([height, 0]);
	  var formatValue = d3.format(".2s");

    var svg = d3.select("#histchartBox").append("svg")
      // .attr("width", width + margin.left + margin.right)
      // .attr("height", height + margin.top + margin.bottom)
	  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 500 300")
      .append("g")
      .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");
	  
	  

    // get the data
    
    $.get("histplot", function(data){
        //alert("Data Recieved");
        // format the data
      data.forEach(function (d) {
        d.spend = +d.spend;
      });

      // Scale the range of the data in the domains
      x.domain(data.map(function (d) { return d.Year; }));
      y.domain([0, d3.max(data, function (d) { return d.spend; })]);

      // append the rectangles for the bar chart
      svg.selectAll(".histbar")
        .data(data)
        .enter().append("rect")
        .attr("class", "histbar")
        .attr("x", function (d) { return x(d.Year); })
        .attr("width", x.bandwidth())
        .attr("y", function (d) { return y(d.spend); })
        .attr("height", function (d) { return height - y(d.spend); });
		
		 svg.selectAll("text.histbar")
        .data(data)
        .enter().append("text")
        .attr("class", "")
        .attr("text-anchor", "middle")
          .attr("x", function (d) { return x(d.Year) + 26; })
        .attr("y", function (d) { return y(d.spend) -5; })
        .text(function (d) { return "$"+formatValue(d.spend); });

      // add the x Axis
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
		.style("font", "bold 0.75rem Arial")
        .call(d3.axisBottom(x));

      // add the y Axis
      svg.append("g")
        .call(d3.axisLeft(y)
          .ticks(5)
          .tickFormat(d3.format(".0s")));
		  
		   svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Spend($ M)"); 
    });
    
  

  }


  function bookChart() {
    // alert('bookChart');

    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 20, bottom: 30, left: 60 },
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
      .range([0, width])
      .padding(0.6);
    var y = d3.scaleLinear()
      .range([height, 0]);
	  
    var formatValue = d3.format(".2s");
   
    var svg = d3.select("#revbookchartBox").append("svg")
      // .attr("width", width + margin.left + margin.right)
      // .attr("height", height + margin.top + margin.bottom)
	  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 500 300")
      .append("g")
      .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

    // get the data
    $.get("bookingplot", function (data) {
    
      // format the data

      data.forEach(function (d) {

        d.booking = +d.booking;

      });

      // alert(JSON.stringify(data));

      // Scale the range of the data in the domains

      x.domain(data.map(function (d) { return d.Year; }));

      y.domain([0, d3.max(data, function (d) { return d.booking; })]);

      console.log(y);

      // append the rectangles for the bar chart

      svg.selectAll(".bookbar")

        .data(data)

        .enter().append("rect")

        .attr("class", "bookbar")

        .attr("x", function (d) { return x(d.Year); })

        .attr("width", x.bandwidth())

        .attr("y", function (d) { return y(d.booking); })

        .attr("height", function (d) { return height - y(d.booking); });
		
      svg.selectAll("text.bookbar")
        .data(data)
        .enter().append("text")
        .attr("class", "")
        .attr("text-anchor", "middle")
        .attr("x", function (d) { return x(d.Year) + 26; })
        .attr("y", function (d) { return y(d.booking) - 5; })
        .text(function (d) { return formatValue(d.booking); });



      // add the x Axis
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .style("font", "bold 0.75rem Arial")
        .call(d3.axisBottom(x));

      // add the y Axis
      svg.append("g")
        .call(d3.axisLeft(y)
          .ticks(5)
          // .tickFormat(d3.format(".2s")));
          .tickFormat(function (d) {
            if ((d / 1000) >= 1) {
              d = d / 1000 + "K";
            }
            return d;
          }));
		  
		   svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Total Sales"); 
    });
   
  }
});
