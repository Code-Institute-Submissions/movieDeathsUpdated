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




    //Calculate metrics
    var numMoviesByYear = yearDim.group();


    var totalNumDeathsByYear = yearDim.group().reduceSum(function (d) {
        return d["Body_Count"];
    });


    var totalNumDeathsByMovie = movieDim.group().reduceSum(function (d) {
        return d["Body_Count"];
    });


    var genres = genreDim.group();


    // var avgNumDeathsPerYear = yearDim.group().reduce(
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

    var avgNumDeathsPerYear = yearDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
        function reduceAdd(d, v) {
            ++d.count;
            d.total += v.value;
            console.log(d.count);
            return d;
        },

        function reduceRemove(d, v) {
            --d.count;
            d.total -= v.value;
            return d;
        },

        function reduceInitial() {
            return {
                count: 0,
                total: 0
            };
        }


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
    var movieGenres = dc.pieChart("#genre-chart");
    var avgDeathsPerYearChart = dc.barChart("#avg-deaths-year-chart");


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
        .transitionDuration(500)
        .xAxis().ticks(10);
    deathsPerMovieChart.ordering(function (d) { return -d.value});
    deathsPerMovieChart.rowsCap([10]);
    deathsPerMovieChart.othersGrouper(false);

    movieGenres
        .radius(200)
        .width(800)
        .height(500)
        .transitionDuration(1500)
        .dimension(genreDim)
        .group(genres);

    avgDeathsPerYearChart
        .width(1650)
        .height(400)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(yearDim)
        .group(avgNumDeathsPerYear)
        .transitionDuration(500)
        .x(d3.scale.ordinal().domain([(minYear), (maxYear)]))
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Year")
        .elasticX(true)
        .elasticY(true)
        .yAxis().ticks(10);
    avgDeathsPerYearChart.valueAccessor(function(d) { return d.value.count > 0 ? d.value.total / d.value.count : 0; });






    dc.renderAll();
}

