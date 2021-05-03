function biPlot() {
    // d3.select("svg").remove();
    var functionName = "/plotTop2PCA";
    // $("#div_table").empty();
    // $("div.tooltip").remove();

    $.post(functionName, function (data) {
        var dataAll = JSON.parse(data);
        var dataArray = dataAll[0];
        var axisArray = dataAll[1];
        //no use label_unique.
        //the label_unique has a different order with city_color.
        // var label_unique = dataAll[2];
        // var data_color_list = ["#00FFFF", "#37BFE5", "#8A2BE2", "#0000FF", "#FF1493", "#00FF00", "#FFA500"];

        var color_list = ['aqua', 'blue', 'fuchsia', '#5F9EA0', 'green', 'lime', 'maroon', 'navy', '#008B8B',
            'purple', 'red', '#A52A2A', 'teal'];
        var attr_names = ['ENI', 'SIE', 'PELL', 'SAR', 'PSCA',
            'RI', 'CT', 'SE', 'ESL', 'SFCT', 'TS', 'AELA', 'AMP'];

        var margin = {top: 20 * 2, right: 170, bottom: 70, left: 50},
            width = 640 - margin.left - margin.right,
            height = 420 - margin.top - margin.bottom;

        // var svg=d3.select("#biplotsvg")

        var svg = d3.select("#biplotsvg")
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
            //to accommodate x.
            .domain([d3.min(dataArray, function (d) {
                return d[1];
            }), d3.max(dataArray, function (d) {
                return d[1];
            })]);

        var xAxis = d3.axisBottom(x);

        var yAxis = d3.axisLeft(y)
        // .ticks(10);

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
                // return color_list[label_unique.indexOf(d[2])];
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
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)

        d3.selectAll('.x.axis')
            .selectAll("text")
            .style('font-size', 'medium');
        d3.selectAll('.y.axis')
            .selectAll("text")
            .style('font-size', 'medium');

        svg.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 10) + ")")
            .style("text-anchor", "middle")
            .text("PC1")
            .style("font-weight", "bold");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left - 2 - 10)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("PC2")
            .style("font-weight", "bold");

        svg.append('g')
            .selectAll("marker")
            .data(attr_names)
            .enter()
            .append("marker")
            // .attr("refX", 6)
            // .attr("refY", 6)
            .attr("id", function (d, i) {
                return "triangle" + i;
            })
            .attr("refX", 3)
            .attr("refY", 3)
            .attr("markerWidth", 30)
            .attr("markerHeight", 30)
            .attr("orient", "auto")
            .append("path")
            // .attr("d", "M 0 0 12 6 0 12 3 6")
            .attr("d", "M 0 0 6 3 0 6 1.5 3")
            .attr('fill', function (d, i) {
                return color_list[i];
            });

        svg.append('g')
            .selectAll("axis_arrow")
            .data(axisArray)
            .enter()
            .append("line")
            .attr("x1", function (d) {
                return x(0);
            })
            .attr("y1", function (d) {
                return y(0);
            })
            .attr("x2", function (d) {
                return x(9 * d[0]);
            })
            .attr("y2", function (d) {
                return y(9 * d[1]);
            })
            .attr("stroke-width", 1.7)
            .attr("stroke", function (d, i) {
                return color_list[i];
            })
            .attr("marker-end", function (d, i) {
                return "url(#triangle" + i + ")";
            });

        var legend = svg.selectAll(".legend")
            .data(attr_names)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return `translate(0, ${(i * 20 + 20)})`;
            });

        legend.append("rect")
            .attr("x", innerWidth - 50)
            .attr("y", 8)
            .attr("width", 40)
            .attr("height", 3)
            .style("fill", function (d, i) {
                return color_list[i];
            });

        legend.append("text")
            .attr("x", innerWidth - 75)
            .attr("y", 15)
            .style("text-anchor", "end")
            .style("font-weight", "bold")
            .style("font-size", "10pt")
            .text(function (d, i) {
                return attr_names[i];
            });

        // var count_txt = 0;
        // var count_x = 0;
        // var count_y = 0;
        // svg.append('g')
        //     .selectAll("axis_arrow")
        //     .data(axisArray)
        //     .enter()
        //     .append("text")
        //     .text(function (d,i) {
        //         // count_txt = count_txt + 1;
        //         // var axis_txt = 'X' + count_txt;
        //         var axis_txt=attr_names[i];
        //         return axis_txt;
        //     })
        //     .attr("x", function (d) {
        //         count_x = count_x + 1;
        //         if (count_x === 2 || count_x === 9) {
        //             return x(7 * d[0]) - 13;
        //         }
        //         if (count_x === 13) {
        //             return x(7 * d[0]) + 17;
        //         } else {
        //             return x(7 * d[0]);
        //         }
        //     })
        //     .attr("y", function (d) {
        //         count_y = count_y + 1;
        //         if (count_y === 2 || count_y === 9) {
        //             return y(7 * d[1]) + 5;
        //         }
        //         if (count_y === 13) {
        //             return y(7 * d[1]) + 5;
        //         }
        //         if (d[1] >= 0) {
        //             return y(7 * d[1]) - 5;
        //         } else {
        //             return y(7 * d[1]) + 17;
        //         }
        //     })
        //     .style("text-anchor", "middle")
        //     .style("font-weight", "bold")
        //     .style("font-size", 12);

    });

}

