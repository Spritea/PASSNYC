function pcp() {

    var g = pcpsvg.append('g').attr('id', 'subgroup')
        .attr('transform', `translate(${margin.left * 1.25}, ${margin.top})`);

    // d3.select("#pcp_div").style('top', '975px');

    console.log("pcp");

    parseTime = d3.timeParse("%Y-%m-%d");
    formatTime = d3.timeFormat("%Y-%m-%d");

    var x = $.post('/pcp', function (data) {
        data = JSON.parse(data);
        var pcp_data_ori = data.data;
        var columns = data.column_name
        var city = data.city;
        city_pcp = city;

        pcp_data_ori = JSON.parse(pcp_data_ori);
        pcp_data = []
        for (var i = 0; i < Object.keys(pcp_data_ori).length; i++) {
            pcp_data.push(pcp_data_ori[i])
        }

        console.log(pcp_data)

        var yScale = {}
        var y_data = {}
        for (i in columns) {
            col = columns[i];
            y_data[col] = pcp_data.map(d => d[col]);
            if (["City", "Rigorous Instruction Rating", "Collaborative Teachers Rating",
                "Supportive Environment Rating", "Effective School Leadership Rating",
                "Strong Family-Community Ties Rating", "Trust Rating", "Student Achievement Rating"].indexOf(col) != -1) {
                console.log("Categorical");
                var data_col = d3.nest()
                    .key(function (d) {
                        return d;
                    })
                    .rollup(function (v) {
                        return v.length;
                    })
                    .entries(y_data[col]);

                var category_sort = data_col.map(function (d) {
                    return d.key
                });
                category_sort.sort(function (a, b) {
                    return a.localeCompare(b)
                });

                yScale[col] = d3.scalePoint()
                    .domain(category_sort.map(function (d) {
                        return d
                    }))
                    .range([innerHeight, 0]);
            } else {
                console.log("Numerical");
                y_min = d3.min(y_data[col]);
                y_max = d3.max(y_data[col]);
                yScale[col] = d3.scaleLinear()
                    .domain([y_min, y_max])
                    .range([innerHeight, 0]);
            }
            ;
        }

        xScale = d3.scalePoint()
            .range([0, pcpinnerWidth])
            .domain(columns)
            .padding(0.1);

        console.log(xScale)

        // ==========The following is referred to the template http://bl.ocks.org/sebastian-meier/03df214f456fc100526a posted by professor on piazza=============

        // ======================= implement range selection by brush and axis interchange by drag=================================

        // ===================================Main modifications beyond the template ========================================
        // 1. updated the code from d3.v3 to d3.v4 (most of the brush functions were updated);
        // 2. modified for my dataset format;
        // 3. colored the brush selected data by colors;
        // 4. added interactions with MDS 1-|correlation| distance


        var dragging = {};

        var background = g.append("g")
            .attr("class", "background")
            .selectAll("path")
            .data(pcp_data)
            .enter().append("path")
            .attr("d", path);

        var foreground = g.append("g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(pcp_data)
            .enter().append("path")
            .attr("d", path)
            .style("stroke", function (d, i) {
                return (city_color[city[i]]);
            });

        //before the action.
        //below for line path action.
        background
            .attr("stroke-dasharray", function () {
                var a = this.getTotalLength();
                // return pathLength = this.getTotalLength();
                //just set a big enough number to shift away
                //from the display area, to hide lines at first.
                return pathLength = 1800;

            })
            .attr("stroke-dashoffset", pathLength)
            .transition()
            .duration(3000)
            .on("start", function repeat() {
                d3.active(this)
                    .attr("stroke-dashoffset", 0)
                // .transition()
                //   .attr("stroke-dashoffset", pathLength)
                // .transition()
                // .on("start", repeat);
            });

        foreground
            .attr("stroke-dasharray", function () {
                return pathLength = 1800;
            })
            .attr("stroke-dashoffset", pathLength)
            .transition()
            .duration(3000)
            .on("start", function repeat() {
                d3.active(this)
                    .attr("stroke-dashoffset", 0)
                // .transition()
                //   .attr("stroke-dashoffset", pathLength)
                // .transition()
                // .on("start", repeat);
            });

        // return svg.node();

        var pcp_g = g.selectAll(".dimension")
            .data(columns)
            .enter().append("g")
            .attr("class", "dimension")

        //below for axis action.
        pcp_g.transition()
            .duration(1500)
            .attr("transform", function (d) {
                return "translate(" + xScale(d) + ")";
            });

        pcp_g.call(d3.drag()
            .on("start", function (d) {
                dragging[d] = xScale(d);
                background.attr("visibility", "hidden");
            })
            .on("drag", function (d) {
                dragging[d] = Math.min(width * 2, Math.max(0, d3.event.x));
                foreground.attr("d", path);
                columns.sort(function (a, b) {
                    return position(a) - position(b);
                });
                xScale.domain(columns.map(function (d) {
                    return d;
                }));
                pcp_g.attr("transform", function (d) {
                    return "translate(" + position(d) + ")";
                })
            })
            .on("end", function (d) {
                delete dragging[d];
                transition(d3.select(this)).attr("transform", "translate(" + xScale(d) + ")");
                transition(foreground).attr("d", path);
                background
                    .attr("d", path)
                    .transition()
                    .delay(500)
                    .duration(0)
                    .attr("visibility", null);
            })
        );

        pcp_g.append("g")
            .attr("class", "axis")
            .each(function (d) {
                d3.select(this).call(d3.axisLeft().scale(yScale[d]));
            })
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function (d) {
                return col_abbr[d];
            })
            // .style("fill", "black")
            .style("font-weight", "bold")
            //below change cursor shape to arrow cross.
            .style('cursor', 'move');

        pcp_g.append("g")
            .attr("class", "brush")
            .each(function (d) {
                d3.select(this).call(yScale[d].brush = d3.brushY().extent([[-8, yScale[d].range()[1]], [8, yScale[d].range()[0]]])
                    .on("start", brushstart).on("brush", brush));
            });

        function brushstart() {
            d3.event.sourceEvent.stopPropagation();
        }

        function brush() {

            var actives = [];
            pcp_g.selectAll(".brush")
                .filter(function (d) {
                    return d3.brushSelection(this);
                })
                .each(function (d) {
                    actives.push({
                        dimension: d,
                        extent: d3.brushSelection(this)
                    });
                });

            // foreground.style("display", function (d,i) {
            //     return actives.every(function (p) {
            //         return p.extent[0] <= yScale[p.dimension](d[p.dimension]) && yScale[p.dimension](d[p.dimension]) <= p.extent[1];
            //     }) ? null : "none";
            // });
            var brush_flag = [];

            for (let i = 0; i < pcp_data.length; i++) {
                var d=pcp_data[i];
                var in_brush = (actives.every(function (p) {
                    return p.extent[0] <= yScale[p.dimension](d[p.dimension]) && yScale[p.dimension](d[p.dimension]) <= p.extent[1];
                }))
                if (in_brush) {
                    brush_flag.push(1);
                } else {
                    brush_flag.push(0);
                }
            }

            //below changes pcp line color directly, didn't merge the result of other plots.
            //no use it.
            // foreground.style("display", function (d) {
            //     if (actives.every(function (p) {
            //         return p.extent[0] <= yScale[p.dimension](d[p.dimension]) && yScale[p.dimension](d[p.dimension]) <= p.extent[1];
            //     })) {
            //         brush_flag.push(1);
            //         return null;
            //     } else {
            //         brush_flag.push(0);
            //         return 'none';
            //     }
            // });

            brush_flag_pcp = brush_flag;
            var brush_final = merge_global_brush();
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
            for (let p = 0; p < city.length; p++) {
                let one_record_flag = brush_final[p];
                if (one_record_flag == 1) {
                    let city_label = city[p];
                    city_dict[city_label] = city_dict[city_label] + 1;
                }
            }
            var city_data = [];
            for (let city_key in city_dict) {
                city_data.push({'city': city_key, 'num': city_dict[city_key]});
            }
            // console.log(city_num_list)
            barchart_update(city_data);

        }

        function position(d) {
            var v = dragging[d];
            return v == null ? xScale(d) : v;
        }

        function transition(g) {
            return g.transition().duration(500);
        }

        function path(d) {
            return d3.line()(columns.map(function (p) {
                var v = dragging[p];
                var tx = v == null ? xScale(p) : v;
                return [tx, yScale[p](d[p])];
            }));
        }

// ===============================================================================================================

        // var legend = g.selectAll(".legend") 
        // .data(clusters)
        // .enter().append("g")
        // .attr("class", "legend")
        // .attr("transform", function(d, i) { return `translate(0, ${(i * 16 - 100)})`; });

        // legend.append("circle")
        // .attr("cx", 65)
        // .attr("cy", 5)
        // .attr("r", 3)
        // .style("fill", function(d, i){ return colors[i]});

        // legend.append("text")
        // .attr("x", 50)
        // .attr("y", 12)
        // .style("text-anchor", "end")
        // .style("font-size", "16px")
        // .text(function(d, i) { 
        //     return d;
        // });

    });

};
  
