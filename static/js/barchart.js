function barchart() {
    console.log("barchart");

    var g = barchartsvg.append('g').attr('id', 'maingroup')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

    // var svg_left = d3.select("#barchart_div").style('left')
    // svg_left = +svg_left.slice(0, svg_left.length-2)
    // console.log(d3.select("#barchart_div").style('left'))
    // console.log(svg_left)
    var svg_left = 1280

    $.post('/barchart', function(data){

        data = JSON.parse(data);
        console.log(data);
        
        var xScale = d3.scaleBand()
        .domain(data.map(function(d, i){
            return d['city'];
        }))
        .rangeRound([0, innerWidth])
        .padding(0.1);

        var yScale = d3.scaleLinear().
        domain([0, d3.max(data.map(p => p['num']))]).
        range([innerHeight, 0])

        var rect = g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("fill", function(d){return city_color[d['city']]})
        .attr("x", function(d){
            return xScale(d['city']);
        })
        .attr("y", function(d){
            return yScale(d['num']);
        })
        .attr("width", xScale.bandwidth())
        .attr("height",function(d){
            return innerHeight - yScale(d['num']);
        })
        .on("mouseover",function(d,i){
            tooltip.html(d['num'])
            .style("top", +d3.select(this).attr('y') + margin.top + 20 + "px")
            .style("left", +d3.select(this).attr('x') + d3.select(this).attr('width')/2 + svg_left - 10 + margin.left + "px")
            .style("visibility", "visible"); 
            d3.select(this)
              .attr("fill","red");
        })
        .on("mouseout",function(d,i){
            d3.select(this)
              .attr("fill", function(d){return city_color[d['city']]});
            tooltip.style("visibility", "hidden");
        });

        var yAxis = d3.axisLeft(yScale);
        var xAxis = d3.axisBottom(xScale);
        g.append('g').attr("class", "y-axis").call(yAxis).selectAll("text")
            .style("font-size", 12);
        g.append('g').attr("class", "x-axis").call(xAxis).attr('transform', `translate(0, ${innerHeight})`).selectAll("text")
            .style("font-size", 12);

        g.append('text')
        .attr('font-size', 12)
        .attr('fill', 'black')
        .text('Number');

        g.append('text')
        .attr('x', innerWidth)
        .attr('y', innerHeight)
        .attr('font-size', 12)
        .attr('fill', 'black')
        .text("City");
    });
};