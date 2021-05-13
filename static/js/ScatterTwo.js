function scatterTwo() {
    // d3.select("svg").remove();
    var functionName = "/plotScatterTrust";
    // $("#div_table").empty();
    // $("div.tooltip").remove();

    $.post(functionName, function (data) {
        var dataAll = JSON.parse(data);
        var dataArray = dataAll[0];
        var x_name = dataAll[1];
        var y_name = dataAll[2];
        var margin = {top: 20 * 2, right: 170, bottom: 70, left: 50},
            width = 640 - margin.left - margin.right,
            height = 420 - margin.top - margin.bottom;

        // var svg=d3.select("#biplotsvg")

        var svg = d3.select("#scattersvg2")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            // .attr("id", "canvas")
            // .attr("transform", "translate(" + 300 + "," + 70 + ")")
            .append("g")
            .attr("transform", "translate(" + (margin.left + 50) + "," + (margin.top + 10) + ")");

        var x = d3.scaleLinear()
            .range([0, width])
            .domain([d3.min(dataArray, function (d) {
                return d[0];
            }), d3.max(dataArray, function (d) {
                return d[0];
            })]);
        var y = d3.scaleLinear()
            .range([height, 0])
            .domain([d3.min(dataArray, function (d) {
                return d[1];
            }), d3.max(dataArray, function (d) {
                return d[1];
            })]);

        var xAxis = d3.axisBottom(x);
        var yAxis = d3.axisLeft(y);

        svg.append('g')
            .selectAll("dot")
            .data(dataArray)
            .enter()
            .append("circle")
            .attr("cx", d3.min(dataArray, function (d) {
                return x(d[0]);
            }))
            .attr("cy", function (d) {
                return y(d[1]);
            })
            .attr("r", 3)
            .style("fill", function (d) {
                return city_color[d[2]];
            })
            //below for action.
            .transition()
            .delay(function (d, i) {
                return (i)
            })
            .duration(1500)
            .attr("cx", function (d) {
                return x(d[0]);
            })
            .attr("cy", function (d) {
                return y(d[1]);
            });

        svg.append("g")
            .attr("class", "brush")
            .call(d3.brush()
                .extent([[0, 0], [width, height]])
                //no 'start brush', since 'start' would give two points
                //with same coord.
                //cannot use .on('brush',update(dataArray,"brush_flag_scatter",x,y))
                //since func para can't be passed.
                .on('brush', function () {
                    update(dataArray,"brush_flag_scatter_two",x,y)
                }));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)

        svg.selectAll('.x.axis')
            .selectAll("text")
            .style('font-size', '12px');
        svg.selectAll('.y.axis')
            .selectAll("text")
            .style('font-size', 'medium');

        svg.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 5) + ")")
            .style("text-anchor", "middle")
            .text(x_name)
            .style("font-weight", "bold")
            .style("font-size", "14px");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left - 2 - 10)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1px")
            .style("text-anchor", "middle")
            .text(y_name)
            .style("font-weight", "bold")
            .style("font-size", "14px");

    });

}
