/**
 * Created by BLong on 03/03/2017.
 */
queue()
    .defer(d3.json, "/movieDeaths/projects")
    .await(makeGraphs);

function makeGraphs(error, movieDeathsProjects) {

    // -- Create a crossfilter instance -- //
    var ndx = crossfilter(movieDeathsProjects);


    // -- Define dimensions -- //
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


    // -- Calculate metrics -- //
    var numMoviesByYear = yearDim.group();


    var totalNumDeathsByMovie = movieDim.group().reduceSum(function (d) {
        return d["Body_Count"];
    });


    var numDeathsPerMinute = movieDim.group().reduceSum(function (d) {
        return parseFloat(d["Body_Count"] / d["Length_Minutes"]).toFixed(2);
    });


    var numDeathsPerDirector = directorDim.group().reduceSum(function (d) {
        return d["Body_Count"];
    });


    var numDeathsPerMinuteDirector = directorDim.group().reduceSum(function (d) {
        return parseFloat(d["Body_Count"] / d["Length_Minutes"]).toFixed(2);
    });


    var avgDeathsPerYear = yearDim.group().reduce(
        function reduceAdd(p, v) {
            ++p.count;
            p.sum_deaths += v["Body_Count"];
            p.average = p.sum_deaths / p.count;
            return p;
        },
        function reduceRemove(p, v) {
            --p.count;
            p.sum_deaths -= v["Body_Count"];
            if (p.count === 0)
                p.average = 0;
            else
                p.average = p.sum_deaths / p.count;
            return p;
        },
        function reduceInitial() {
            return {count: 0, sum_deaths: 0, average: 0};
        }
    );


    var statsByMovie = movieDim.group().reduce(
        function (p, v) {
            p.deaths_minute += +v["Deaths_Minute"];
            p.imdb_rating += +v["IMDB_Rating"];
            p.body_count += +v["Body_Count"];
            return p;
        },
        function (p, v) {
            p.deaths_minute -= +v["Deaths_Minute"];
            p.imdb_rating -= +v["IMDB_Rating"];
            p.body_count -= +v["Body_Count"];
            return p;
        },
        function () {
            return {deaths_minute: 0, imdb_rating: 0, body_count: 0}
        }
    );


    var numberFormat = d3.format(".0f");



    // -- Define values (to be used in charts) -- //
    var minYear = yearDim.bottom(1)[0]["Year"];
    var maxYear = yearDim.top(1)[0]["Year"];


    // -- Charts -- //
    var moviesPerYearChart = dc.barChart("#year-movie-chart");
    var avgDeathsPerYearChart = dc.barChart("#year-death-chart");
    var deathsPerMovieChart = dc.rowChart("#deaths-movie-chart");
    var deathsPerMinuteChart = dc.rowChart("#deaths-minute-chart");
    var deathsPerDirectorChart = dc.rowChart("#deaths-director-chart");
    var deathsPerMinuteDirectorChart = dc.rowChart("#deaths-minute-director-chart");
    var bodyCountIMDBChart = dc.bubbleChart("#body-imdb-chart");
    var movieGenres = dc.pieChart("#genre-chart");


    moviesPerYearChart // -- BarChart -- //
        .width(820)
        .height(200)
        .margins({top: 10, right: 50, bottom: 30, left: 30})
        .dimension(yearDim)
        .group(numMoviesByYear)
        .transitionDuration(1500)
        .x(d3.scale.ordinal().range([(minYear), (maxYear)]))
        .xUnits(dc.units.ordinal)
        .elasticX(true)
        .elasticY(true)
        .yAxis().ticks(10);


    avgDeathsPerYearChart // -- BarChart -- //
        .width(820)
        .height(400)
        .margins({top: 30, right: 50, bottom: 50, left: 50})
        .dimension(movieDim)
        .group(avgDeathsPerYear)
        .transitionDuration(1500)
        .x(d3.scale.ordinal().range([(minYear), (maxYear)]))
        .xUnits(dc.units.ordinal)
        .elasticX(true)
        .elasticY(true)
        .yAxis().ticks(10);
        // .valueAccessor(function (p) {
        //     return p.value.average;
        // });


    deathsPerMovieChart // -- RowChart -- //
        .width(820)
        .height(280)
        .margins({top: 0, right: 50, bottom: 20, left: 20})
        .elasticX(true)
        .transitionDuration(1500)
        .dimension(movieDim)
        .group(totalNumDeathsByMovie);
    deathsPerMovieChart.ordering(function (d) {
        return -d.value
    });
    deathsPerMovieChart.rowsCap([10]);
    deathsPerMovieChart.othersGrouper(false);


    deathsPerMinuteChart // -- RowChart -- //
        .width(820)
        .height(280)
        .margins({top: 0, right: 50, bottom: 20, left: 20})
        .elasticX(true)
        .dimension(movieDim)
        .group(numDeathsPerMinute)
        .transitionDuration(1500)
        .xAxis().ticks(10);
    deathsPerMinuteChart.ordering(function (d) {
        return -d.value
    });
    deathsPerMinuteChart.rowsCap([10]);
    deathsPerMinuteChart.othersGrouper(false);


    deathsPerDirectorChart // -- RowChart -- //
        .width(800)
        .height(320)
        .x(d3.scale.linear().domain([0, 6]))
        .elasticX(true)
        .dimension(directorDim)
        .group(numDeathsPerDirector)
        .transitionDuration(1500)
        .xAxis().ticks(10);
    deathsPerDirectorChart.ordering(function (d) {
        return -d.value
    });
    deathsPerDirectorChart.rowsCap([10]);
    deathsPerDirectorChart.othersGrouper(false);


    deathsPerMinuteDirectorChart // -- RowChart -- //
        .width(800)
        .height(320)
        .x(d3.scale.linear().domain([0, 6]))
        .elasticX(true)
        .dimension(directorDim)
        .group(numDeathsPerMinuteDirector)
        .transitionDuration(1500)
        .xAxis().ticks(10);
    deathsPerMinuteDirectorChart.ordering(function (d) {
        return -d.value
    });
    deathsPerMinuteDirectorChart.rowsCap([10]);
    deathsPerMinuteDirectorChart.othersGrouper(false);


    movieGenres // -- PieChart -- //
            .radius(200)
            .width(800)
            .height(500)
            .transitionDuration(1500)
            .dimension(genreDim)
            .group(genres)
            .externalLabels(-30)
            .minAngleForLabel(0.0001);
        movieGenres.ordering(function (d) {
            return -d.value
        });
        movieGenres.slicesCap([13]);


    bodyCountIMDBChart // -- BubbleChart -- //
        .width(1650)
        .height(800)
        .margins({top: 20, right: 100, bottom: 30, left: 40})
        .transitionDuration(1500)
        .dimension(movieDim)
        .group(statsByMovie)
        .colors(d3.scale.category20())
        .keyAccessor(function (p) {
            return p.value.imdb_rating;
        })
        .valueAccessor(function (p) {
            return p.value.deaths_minute;
        })
        .radiusValueAccessor(function (p) {
            return p.value.body_count;
        })
        .x(d3.scale.linear().range([1, 10]))
        .r(d3.scale.linear().domain([0, 850]))
        .minRadiusWithLabel(34)
        .elasticY(true)
        .yAxisPadding(.5)
        .elasticX(true)
        .xAxisPadding(1)
        .xAxisLabel("IMDB Rating")
        .yAxisLabel("Body Count/Minute")
        .maxBubbleRelativeSize(.05)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .renderLabel(true)
        .renderTitle(true)
        .title(function (p) {
            return p.key
                + "\n"
                + "Body Count : " + numberFormat(p.value.body_count)
        });
    bodyCountIMDBChart.yAxis().tickFormat(function (s) {
        return s;
    });
    bodyCountIMDBChart.xAxis().tickFormat(function (s) {
        return s;
    });



    // -- jQuery for scrolling to set points -- //
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.scrollUp').fadeIn();
        } else {
            $('.scrollUp').fadeOut();
        }
    });


    $('.scrollUp').click(function () {
        $("html, body").animate({
            scrollTop: 0
        }, 1500);
        return false;
    });


    dc.renderAll();
}

