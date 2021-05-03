function scatterOne() {
    // d3.select("svg").remove();
    var functionName = "/plotScatterSchoolIncome";
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

        var svg = d3.select("#scattersvg")
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

        // svg.append('g')
        //     .selectAll("dot")
        //     .data(dataArray)
        //     .enter()
        //     .append("circle")
        //     .attr("cx", function (d) {
        //         return x(d[0]);
        //     })
        //     .attr("cy", function (d) {
        //         return y(d[1]);
        //     })
        //     .attr("r", 3)
        //     .style("fill", function (d) {
        //         return city_color[d[2]];
        //     });

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
                .on('brush', update));

        //init global brush flag.
        for (let k = 0; k < dataArray.length; k++) {
            brush_flag_scatter.push(1);
            brush_flag_barchart.push(1);
            brush_flag_pcp.push(1);
        }

        function update() {
            //1: in brush,0: out of brush.
            var brush_flag = [];
            var extent = d3.event.selection;
            for (let i = 0; i < dataArray.length; i++) {
                var in_brush = isBrushed(extent, x(dataArray[i][0]), y(dataArray[i][1]));
                if (in_brush) {
                    brush_flag.push(1);
                } else {
                    brush_flag.push(0);
                }
            }
            // console.log(extent)
            console.log('kk')
            // console.log(arr_flag)
            brush_flag_scatter = brush_flag;

            var brush_final=merge_global_brush();

            update_scatterplot("#scattersvg", brush_final);
            update_scatterplot("#scattersvg2", brush_final);
            update_scatterplot("#biplotsvg", brush_final);
            update_pcp("#pcpsvg", brush_final);

            //below for bar chart brush update.
            //count the out of brush data number of each city.
            var city_dict = {};
            var city_list = ["Brooklyn", "Bronx", "New York", "Staten Island", "Jamaica", "Flushing", "Long Island"];
            for (let k = 0; k < city_list.length; k++) {
                city_dict[city_list[k]] = 0;
            }
            for (let p = 0; p < dataArray.length; p++) {
                let one_record_flag = brush_final[p];
                if (one_record_flag == 1) {
                    let city_label = dataArray[p][2];
                    city_dict[city_label] = city_dict[city_label] + 1;
                }
            }
            var city_data = [];
            for (let city_key in city_dict) {
                city_data.push({'city': city_key, 'num': city_dict[city_key]});
            }
            // console.log(city_num_list)
            barchart_update(city_data);

            // var one_plot = d3.select("#barchartsvg").selectAll("rect");
            // one_plot.attr("y", function (d,i) {
            //     return yscale_barchart(d['num']-city_num_list[i]);
            // });
            // one_plot.attr("height", function (d,i) {
            //     return innerheight_barchart - yscale_barchart(d['num']-city_num_list[i]);
            // });
            // one_plot.on("mouseover", function (d, i) {
            //     // tooltip.html(d['num'])
            //     tooltip_barchart.html(d['num'] - city_num_list[i]);
            // });
        }

        function isBrushed(brush_coords, cx, cy) {
            var x0 = brush_coords[0][0],
                x1 = brush_coords[1][0],
                y0 = brush_coords[0][1],
                y1 = brush_coords[1][1];
            return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
            // This return TRUE or FALSE depending on if the points is in the selected area
        }

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
            .text(x_name)
            .style("font-weight", "bold");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left - 2 - 30)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1px")
            .style("text-anchor", "middle")
            .text(y_name)
            .style("font-weight", "bold");

    });

}
