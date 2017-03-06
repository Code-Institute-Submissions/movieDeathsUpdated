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

    var movieDim = ndx.dimension(function (d) {
        return d["Film"];
    });

    var genreDim = ndx.dimension(function (d) {
        return d["Genre"];
    });

    var directorDim = ndx.dimension(function (d) {
        return d["Director"];
    });

    // var minuteDim = ndx.dimension(function (d) {
    //     return d["Deaths_Minute"];
    // });

    // var deathsDim = ndx.dimension(function (d) {
    //     return d["Body_Count"];
    // });




    //Calculate metrics
    var numMoviesByYear = yearDim.group();


    var totalNumDeathsByYear = yearDim.group().reduceSum(function (d) {
        return d["Body_Count"];
    });


    var totalNumDeathsByMovie = movieDim.group().reduceSum(function (d) {
        return d["Body_Count"];
    });

    var numDeathsPerMinute = movieDim.group().reduceSum(function (d) {
        // return 0.01;
        return d["Body_Count"] / d["Length_Minutes"];
    });

    var numDeathsPerDirector = directorDim.group().reduceSum(function (d) {
        return d["Body_Count"];
    });

    var numDeathsPerMinuteDirector = directorDim.group().reduceSum(function (d) {
        return d["Body_Count"] / d["Length_Minutes"];
    });

    var genres = genreDim.group();

    // var avgNumDeathsPerYear = yearDim.group().reduce(
    //     //add
    //     function (d, v) {
    //         ++d.count;
    //         d.sum += v.units / 2;
    //         d.avg = d.sum / d.count;
    //         return d["Body_Count"];
    //     },
    //     //remove
    //     function (d, v) {
    //         --d.count;
    //         d.sum += v.units / 2;
    //         d.avg = d.sum / d.count;
    //         return d["Body_Count"];
    //     },
    //     //init
    //     function (d, v) {
    //         return {
    //             count: 0,
    //             sum: 0,
    //             avg: 0
    //         };
    //     });

    // var avgNumDeathsPerYear = yearDim.group().reduce(
    //     function (d, v) {
    //         ++d.count;
    //         d.sumDeaths += (v.open + v.close) / 2;
    //         d.avgDeaths = d.sumDeaths / d.count;
    //         return d;
    //     },
    //
    //     function (d, v) {
    //         --d.count;
    //         d.sumDeaths -= (v.open - v.close) / 2;
    //         d.avgDeaths = d.count ? d.sumDeaths / d.count : 0;
    //         return d;
    //     },
    //
    //     function () {
    //         return {
    //             count: 0,
    //             sumDeaths: 0,
    //             avgDeaths: 0
    //         };
    //     }
    // );
    //
    //
    // var avgNumDeathsPerYear = yearDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
    //     function reduceAdd(d, v) {
    //         ++d.count;
    //         d.total += v.deaths;
    //         d.average = (d.total / d.count) / 2;
    //         return d;
    //     }
    //
    //     function reduceRemove(d, v) {
    //         --d.count;
    //         d.total -= v.deaths;
    //         d.average = (d.total / d.count) / 2;
    //         return d;
    //     }
    //
    //     function reduceInitial() {
    //         return {
    //             count: 0,
    //             total: 0,
    //             average: 0
    //         };
    //     }


    //     function (d, v) {
    //         ++d.count;
    //         d.sumDeaths += (v.open + v.close) / 2;
    //         d.avgDeaths = d.sumDeaths / d.count;
    //         return d["Body_count"];
    //     },
    //
    //     function (d, v) {
    //         --d.count;
    //         d.sumDeaths -= (v.open - v.close) / 2;
    //         d.avgDeaths = d.count ? d.sumDeaths / d.count : 0;
    //         return d["Body_count"];
    //     },
    //
    //     function () {
    //         return {
    //             count: 0,
    //             sumDeaths: 0,
    //             avgDeaths: 0
    //         };
    //     }
    // );


    //Define values (to be used in charts)
    var minYear = yearDim.bottom(1)[0]["Year"];
    var maxYear = yearDim.top(1)[0]["Year"];


    //Charts
    var moviesPerYearChart = dc.barChart("#year-movie-chart");
    var deathsPerYearChart = dc.lineChart("#year-death-chart");
    var deathsPerMovieChart = dc.rowChart("#deaths-movie-chart");
    var deathsPerMinuteChart = dc.rowChart("#deaths-minute-chart");
    var deathsPerDirectorChart = dc.rowChart("#deaths-director-chart");
    var deathsPerMinuteDirectorChart = dc.rowChart("#deaths-minute-director-chart");
    var movieGenres = dc.pieChart("#genre-chart");
    // var avgDeathsPerYearChart = dc.lineChart("#avg-deaths-year-chart");


    moviesPerYearChart
        .width(1650)
        .height(400)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(yearDim)
        .group(numMoviesByYear)
        .transitionDuration(500)
        .x(d3.scale.ordinal().domain([(minYear), (maxYear)]))
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Year")
        .elasticX(true)
        .elasticY(true)
        .yAxis().ticks(10);

    deathsPerYearChart
        .width(1650)
        .height(400)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(yearDim)
        .group(totalNumDeathsByYear)
        .transitionDuration(500)
        .x(d3.scale.ordinal().domain([(minYear), (maxYear)]))
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Year")
        .elasticX(true)
        .elasticY(true)
        .yAxis().ticks(10);

    deathsPerMovieChart
        .width(800)
        .height(500)
        .dimension(movieDim)
        .group(totalNumDeathsByMovie)
        .transitionDuration(1500)
        .xAxis().ticks(10);
    deathsPerMovieChart.ordering(function (d) { return -d.value});
    deathsPerMovieChart.rowsCap([10]);
    deathsPerMovieChart.othersGrouper(false);

    deathsPerMinuteChart
        .width(800)
        .height(500)
        .x(d3.scale.linear().domain([0,6]))
        .elasticX(true)
        .dimension(movieDim)
        .group(numDeathsPerMinute)
        .transitionDuration(1500)
        .xAxis().ticks(10);
    deathsPerMinuteChart.ordering(function (d) { return -d.value});
    deathsPerMinuteChart.rowsCap([10]);
    deathsPerMinuteChart.othersGrouper(false);


    deathsPerDirectorChart
        .width(800)
        .height(500)
        .x(d3.scale.linear().domain([0,6]))
        .elasticX(true)
        .dimension(directorDim)
        .group(numDeathsPerDirector)
        .transitionDuration(1500)
        .xAxis().ticks(10);
    deathsPerDirectorChart.ordering(function (d) { return -d.value});
    deathsPerDirectorChart.rowsCap([10]);
    deathsPerDirectorChart.othersGrouper(false);


    deathsPerMinuteDirectorChart
        .width(800)
        .height(500)
        .x(d3.scale.linear().domain([0,6]))
        .elasticX(true)
        .dimension(directorDim)
        .group(numDeathsPerMinuteDirector)
        .transitionDuration(1500)
        .xAxis().ticks(10);
    deathsPerMinuteDirectorChart.ordering(function (d) { return -d.value});
    deathsPerMinuteDirectorChart.rowsCap([10]);
    deathsPerMinuteDirectorChart.othersGrouper(false);

    movieGenres
        .radius(200)
        .width(800)
        .height(500)
        .transitionDuration(1500)
        .dimension(genreDim)
        .group(genres)
        .externalLabels(50);


    // avgDeathsPerYearChart
    //     .width(1650)
    //     .height(400)
    //     .margins({top: 10, right: 50, bottom: 30, left: 50})
    //     .dimension(yearDim)
    //     .group(avgNumDeathsPerYear)
    //     .transitionDuration(500)
    //     .x(d3.scale.ordinal().domain([(minYear), (maxYear)]))
    //     .xUnits(dc.units.ordinal)
    //     .xAxisLabel("Year")
    //     .elasticX(true)
    //     .elasticY(true)
    //     .yAxis().ticks(10);
    // avgDeathsPerYearChart.valueAccessor(function (d) { return d.value; });






    dc.renderAll();
}

