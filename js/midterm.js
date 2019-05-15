(function () {

    let data = "no data";
    let svgContainer = ""
    window.onload = function () {
        svgContainer = d3.select('body')
            .append('svg')
            .attr('height', 500)
            .attr('width', 1250)

        svgContainer.append('rect')
            .attr("x", 75)
            .attr("y", 50)
            .attr("height", 400)
            .attr("width", 1125)
            .attr("fill", "white")

        d3.csv("../data/seasons_data.csv")
            .then((data) => {
                plotHistogram(data)
            })
    }

    function makeTitle() {
        svgContainer.append('text')
            .attr("class", "subtitle")
            .attr("x", 30)
            .attr("y", 12)
            .attr("font-weight", "bold")
            .attr("font-size", "15")
            .text("Despite a successful run of 26 seasons, ratings have dropped at a steady rate losing an average of 7.5% viewers each year.");

        svgContainer.append('rect')
            .attr("x", 30)
            .attr("y", 20)
            .attr("height", 25)
            .attr("width", 1170)
            .attr("fill", "#6CAEE2")

        svgContainer.append('text')
            .attr("x", 35)
            .attr("y", 40)
            .attr("fill", "white")
            .attr("font-style", "italic")
            .attr("font-size", "20")
            .text("Average Viewership By Season")
    }

    function makeLegend() {
        svgContainer.append('text')
            .attr("x", 900)
            .attr("y", 60)
            .attr("dy", "1em")
            .attr("font-weight", "bold")
            .text("Viewership Data");

        svgContainer.append('rect')
            .attr("x", 900)
            .attr("y", 80)
            .attr("height", 12)
            .attr("width", 12)
            .attr("fill", "#6CAEE2")
            .attr("stroke", "gray")

        svgContainer.append('text')
            .attr("x", 917)
            .attr("y", 78)
            .attr("dy", "1em")
            .text("Actual");

        svgContainer.append('rect')
            .attr("x", 900)
            .attr("y", 99)
            .attr("height", 12)
            .attr("width", 12)
            .attr("fill", "gray")
            .attr("stroke", "gray")

        svgContainer.append('text')
            .attr("x", 917)
            .attr("y", 97)
            .attr("dy", "1em")
            .text("Estimated");
    }

    function plotHistogram(data) {
        makeTitle();
        makeLegend();

        let div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        let years = data.map((row) => parseFloat(row["Year"]));
        let views = data.map((row) => parseFloat(row["Avg. Viewers (mil)"]));

        let minYear = d3.min(years);
        let maxYear = d3.max(years);
        let maxView = d3.max(views);

        let xScale = d3.scaleLinear()
            .domain([minYear, maxYear])
            .range([100, 1175])
            .nice();

        let xAxis = d3.axisBottom().scale(xScale).ticks(23);

        svgContainer.append("g")
            .attr('transform', 'translate(0, 450)')
            .call(xAxis);

        let yScale = d3.scaleLinear()
            .domain([0, maxView + 2])
            .range([450, 50])
            .nice();

        let yAxis = d3.axisLeft().scale(yScale);

        svgContainer.append('g')
            .attr('transform', 'translate(75, 0)')
            .call(yAxis);

        for (let i = minYear; i <= maxYear; i++) {
            let filtered_data = data.filter((row) => row["Year"] == i);
            let viewsByYear = filtered_data.map((row) => parseFloat(row["Avg. Viewers (mil)"]));
            
            let rect = svgContainer.append("rect")
                .attr("class", "bar")
                .attr("x", () => xScale(i) - 15
                )
                .attr("y", (y) => {
                    meanviews = d3.mean(viewsByYear);
                    height = yScale(meanviews);
                    return height;
                })
                .attr("width", 33)
                .attr("height", () => 450 - yScale(meanviews))
                .attr("stroke", "gray")
                .on("mouseover", (d) => {
                    filtered_data = data.filter((row) => row["Year"] == i)
                    viewsByYear = filtered_data.map((row) => parseFloat(row["Avg. Viewers (mil)"]))
                    div.transition()
                        .duration(0)
                        .style("opacity", 1);

                    div.html(
                        "<div class=\"seasonYear\">Season #" + i + "</div>" + "<br/>" +
                        "<div class=\"seasonDesc\">Year: " + i + "</div>" + "<br/>" +
                        "<div class=\"seasonDesc\">Episode: " + filtered_data[0]["Episodes"] + "</div>" + "<br/>" +
                        "<div class=\"seasonDesc\">Avg Viewers(mil): " + Math.round(meanviews * 10) / 10 + "</div><br/>" +
                        "<div class=\"seasonDesc\">Most Watched Episodes: " + filtered_data[0]["Most watched episode"] + "</div><br/>" +
                        "<div class=\"seasonDesc\">Viewers:" + filtered_data[0]["Viewers (mil)"] + "</div><br/>"
                    )
                        .style("left", d3.event.pageX + "px")
                        .style("top", d3.event.pageY + "px");
                })
                .on("mouseout", (d) => {
                    div.transition()
                        .duration(0)
                        .style("opacity", 0);
                });

            if (filtered_data[0]["Data"] == "Actual") {
                rect.attr("fill", "#6CAEE2")
            } else {
                rect.attr("fill", "#908782")
            }

            //labels above each bar
            svgContainer.append("text")
                .attr("x", xScale(i))
                .attr("y", height - 5)
                // .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text(Math.round(meanviews * 10) / 10)

            //label for y axis
            svgContainer.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 25)
                .attr("x", -275)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Avg. Viewers (in millions)");

        }

        svgContainer.append("line")
            .attr("x1", 75)
            .attr("y1", yScale(d3.mean(views)))
            .attr("x2", 1200)
            .attr("y2", yScale(d3.mean(views)))
            .attr("stroke", "gray")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", 5)

        svgContainer.append('text').append("class", "test")
            .attr("x", 80)
            .attr("y", yScale(d3.mean(views)) - 5)
            .text(Math.round(d3.mean(views) * 10) / 10)
    }
})();