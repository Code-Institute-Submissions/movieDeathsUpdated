/**
 * Created by BLong on 03/03/2017.
 */
queue()
    .defer(d3.json, "/movieDeaths/projects")
    .await(makeGraphs);

function makeGraphs(error, projectsJson) {

    //Clean projectsJson data
    var movieDeathsProjects = projectsJson;


    //Create a crossfilter instance
    var ndx = crossfilter(movieDeathsProjects);


    //Define dimensions
    var yearDim = ndx.dimension(function (d) {
        return d["Year"];
    });

    // var deathsDim = ndx.dimension(function (d) {
    //     return d["Body_Count"];
    // });




    //Calculate metrics
    var numMoviesByYear = yearDim.group();
    var totalNumDeathsByYear = yearDim.group().reduceSum(function (d) {
        return d["Body_Count"];
    });

    //Define values (to be used in charts)
    var minYear = yearDim.bottom(1)[0]["Year"];
    var maxYear = yearDim.top(1)[0]["Year"];


    //Charts
    var yearMovieChart = dc.barChart("#year-movie-chart");
    var yearDeathChart = dc.barChart("#year-death-chart");


    yearMovieChart
        .width(1650)
        .height(400)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(yearDim)
        .group(numMoviesByYear)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minYear, maxYear]))
        .elasticY(true)
        .xAxisLabel("Year")
        .yAxis().ticks(10);

    yearDeathChart
        .width(1650)
        .height(400)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(yearDim)
        .group(totalNumDeathsByYear)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minYear, maxYear]))
        .elasticY(true)
        .xAxisLabel("Year")
        .yAxis().ticks(10);





    dc.renderAll();
}

