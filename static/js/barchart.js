function barchart() {
    console.log("barchart");

    //since barchart_update.js would remove barchart,
    //the global const barchartsvg would be null,
    //need init again.

    var margin = {top: 25 * 2, right: 170, bottom: 70, left: 50};
    var innerWidth = 640 - margin.right;
    var innerHeight = 420 - margin.top - margin.bottom;

    var barchartsvg = d3.select('#barchartsvg');
    barchartsvg.append('g')
        .append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('font-size', 16)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('id', "barchartcaption")
        .text('School Distribution among Cities')
        .style("font-weight", "bold");

    var g = barchartsvg.append('g').attr('id', 'maingroup')
        // .attr("width", innerWidth + margin.left + margin.right)
        // .attr("height", innerHeight + margin.top + margin.bottom)
        .attr('transform', "translate(" + (margin.left + 50) + "," + (margin.top + 10) + ")");

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

    // var innerHeight = 420 - 110
    // innerheight_barchart=innerHeight;
    // var svg_left = d3.select("#barchart_div").style('left')
    // svg_left = +svg_left.slice(0, svg_left.length-2)
    // console.log(d3.select("#barchart_div").style('left'))
    // console.log(svg_left)
    var svg_left = 1280

    $.post('/barchart', function (data) {

        data = JSON.parse(data);
        console.log(data);

        var xScale = d3.scaleBand()
            .domain(data.map(function (d, i) {
                return d['city'];
            }))
            .rangeRound([0, innerWidth - 20])
            .padding(0.1);

        var yScale = d3.scaleLinear().domain([0, d3.max(data.map(p => p['num']))]).range([innerHeight, 0]);
        // yscale_barchart=yScale;

        var city_choose = [];
        var mouse_down_flag = [false, false, false, false, false, false, false];
        var mouse_down_start = 0;
        var rect = g.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("fill", function (d) {
                return city_color[d['city']]
            })
            .attr("x", function (d) {
                return xScale(d['city']);
            })
            .attr("y", function (d) {
                //use yScale(0) for action initialization.
                return yScale(0);
            })
            .attr("width", xScale.bandwidth())
            .attr("height", function (d) {
                //use yScale(0) for action initialization.
                return innerHeight - yScale(0);
            })
            //add hand cursor.
            .style('cursor', 'pointer')
            .on("mouseover", function (d, i) {
                tooltip.html(d['num'])
                    .style("top", +d3.select(this).attr('y') + margin.top + 30 + "px")
                    .style("left", +d3.select(this).attr('x') + d3.select(this).attr('width') / 2 + svg_left + 39 + margin.left + "px")
                    .style("visibility", "visible");
                // d3.select(this)
                //     .attr("fill", "red");
            })
            .on("mouseout", function (d, i) {
                //decide whether mouse down happens.
                if (mouse_down_start == 0) {
                    d3.select(this)
                        .attr("fill", function (d) {
                            return city_color[d['city']]
                        });
                } else {
                    d3.select(this)
                        .attr("fill", function (d) {
                            if (city_choose.includes(d['city']))
                                return city_color[d['city']];
                            else
                                return 'gray';
                        });
                }
                tooltip.style("visibility", "hidden");
            })
            .on('mousedown', function (d, i) {
                mouse_down_start = 1;
                //below code to enable cancel when click twice.
                mouse_down_flag[i] = !mouse_down_flag[i];
                if (mouse_down_flag[i])
                    city_choose.push(d['city']);
                else
                    city_choose.splice(city_choose.indexOf(d['city']), 1);

                d3.select("#barchartsvg").selectAll("rect")
                    .attr("fill", function (d) {
                        if (city_choose.includes(d['city']))
                            return city_color[d['city']];
                        else
                            return 'gray';
                    });

                var brush_flag = [];
                for (let i = 0; i < city_pcp.length; i++) {
                    var in_brush = (city_choose.includes(city_pcp[i]));
                    if (in_brush) {
                        brush_flag.push(1);
                    } else {
                        brush_flag.push(0);
                    }
                }
                brush_flag_barchart = brush_flag;
                var brush_final = merge_global_brush();

                update_scatterplot("#scattersvg", brush_final);
                update_scatterplot("#scattersvg2", brush_final);
                update_scatterplot("#biplotsvg", brush_final);
                update_pcp("#pcpsvg", brush_final);
            });


        // tooltip_barchart=tooltip;
        //add action.
        rect.transition()
            .duration(1500)
            .attr("x", function (d) {
                return xScale(d['city']);
            })
            .attr("y", function (d) {
                return yScale(d['num']);
            })
            .attr("width", xScale.bandwidth())
            .attr("height", function (d) {
                return innerHeight - yScale(d['num']);
            });

        var yAxis = d3.axisLeft(yScale);
        var xAxis = d3.axisBottom(xScale);
        g.append('g').attr("class", "y-axis").call(yAxis).selectAll("text")
            .style("font-size", 'medium');
        g.append('g').attr("class", "x-axis").call(xAxis).attr('transform', `translate(0, ${innerHeight})`).selectAll("text")
            .style("font-size", 11);

        // g.append('text')
        // .attr('font-size', 12)
        // .attr('fill', 'black')
        // .text('Number');

        // g.append('text')
        // .attr('x', innerWidth)
        // .attr('y', innerHeight)
        // .attr('font-size', 12)
        // .attr('fill', 'black')
        // .text("City");

        g.append("text")
            .attr("transform",
                "translate(" + (innerWidth / 2) + " ," +
                (innerHeight + 45) + ")")
            .style("text-anchor", "middle")
            .text("City")
            .style("font-weight", "bold")
            .style("font-size", "14px");

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left - 2 - 10)
            .attr("x", 0 - (innerHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of Schools")
            .style("font-weight", "bold")
            .style("font-size", "14px");
    });
};