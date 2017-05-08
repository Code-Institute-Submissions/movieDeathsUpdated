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

    var mpaaDim = ndx.dimension(function (d) {
        return d["MPAA_Rating"];
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
        return Math.round(d["Body_Count"] / d["Length_Minutes"] * 100) / 100;
    });

// Figure out rounding to 2 decimals and floating point error
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




    var mpaaRating = mpaaDim.group();


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
    var movieGenresPie = dc.pieChart("#genre-chart");
    var mpaaRatingPie = dc.pieChart("#genre-chart-2");

    // var ageRating = dc.


    moviesPerYearChart // -- BarChart -- //
        .width(820)
        .height(200)
        .margins({top: 10, right: 30, bottom: 30, left: 30})
        .colors("#a10300")
        .dimension(yearDim)
        .group(numMoviesByYear)
        .transitionDuration(1500)
        .x(d3.scale.ordinal().domain([(minYear), (maxYear)]))
        .xUnits(dc.units.ordinal)
        .elasticX(true)
        .elasticY(true)
        .yAxis().ticks(10);


    avgDeathsPerYearChart // -- BarChart -- //
        .width(820)
        .height(200)
        .margins({top: 10, right: 30, bottom: 30, left: 30})
        .colors("#a10300")
        .dimension(yearDim)
        .group(avgDeathsPerYear)
        .transitionDuration(1500)
        .x(d3.scale.ordinal().range([(minYear), (maxYear)]))
        .xUnits(dc.units.ordinal)
        .elasticX(true)
        .elasticY(true)
        // .yAxis().ticks(10)
        .valueAccessor(function (p) {
            return p.value.average;
        });


    deathsPerMovieChart // -- RowChart -- //
        .width(820)
        .height(272)
        .margins({top: 5, right: 30, bottom: 20, left: 30})
        .ordinalColors(["#960000", "#9d2001", "#aa4000", "#b75d00", "#c27300", "#c77e00", "#cc8b00", "#d29700", "#d8a400", "#deb300"])
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

        .height(272)
        .margins({top: 5, right: 30, bottom: 20, left: 30})
        .ordinalColors(["#960000", "#9d2001", "#aa4000", "#b75d00", "#c27300", "#c77e00", "#cc8b00", "#d29700", "#d8a400", "#deb300"])
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
        .height(272)
        .margins({top: 5, right: 12, bottom: 20, left: 30})
        .ordinalColors(["#deb300", "#d8a400", "#d29700", "#cc8b00", "#c77e00", "#c27300", "#b75d00", "#aa4000", "#9d2001", "#960000"])
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
        .height(272)
        .margins({top: 5, right: 12, bottom: 20, left: 30})
        .ordinalColors(["#deb300", "#d8a400", "#d29700", "#cc8b00", "#c77e00", "#c27300", "#b75d00", "#aa4000", "#9d2001", "#960000"])
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


    movieGenresPie // -- PieChart -- //
        .radius(170)
        .width(500)
        .height(405)
        .transitionDuration(1500)
        .dimension(genreDim)
        .group(movieGenres)
        .renderLabel(true)
        .minAngleForLabel(.01)
        .externalLabels(-30);
        // .legend(dc.legend().x(0).y(0));
    movieGenres.ordering(function (d) {
        return -d.value
    });
    movieGenres.slicesCap([11]);


    mpaaRatingPie // -- PieChart -- //
        .radius(170)
        .width(500)
        .height(406)
        .transitionDuration(1500)
        .dimension(mpaaDim)
        .group(mpaaRating)
        .ordinalColors(["#5A9BCA", "#B1AED3", "#C6DBEF", "#FDA463", "#5AB576"])
        .renderLabel(true)
        .minAngleForLabel(.01)
        .externalLabels(-30);


    bodyCountIMDBChart // -- BubbleChart -- //
        .width(1180)
        .height(870)
        .margins({top: 20, right: 100, bottom: 30, left: 40})
        .transitionDuration(1500)
        .dimension(movieDim)
        .group(statsByMovie)
        .ordinalColors(["#deb300", "#d8a400", "#d29700", "#cc8b00", "#c77e00", "#c27300", "#b75d00", "#aa4000", "#9d2001", "#960000"])
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
        .yAxisLabel("Body Count per Minute")
        .maxBubbleRelativeSize(.08)
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
        if ($(this).scrollTop() > 800) {
            $('.scrollUp').fadeIn();
        } else {
            $('.scrollUp').fadeOut();
        }
    });


    // Edited scrolling in intro.js (1075) to avoid jerky
    // page movement when scrollTo functionality is implemented

    $('.scrollTo').click(function () {
        $("html, body").animate({
            scrollTop: 729
        }, 1500);
        return false;
    });

    $('.scrollUp').click(function () {
        $("html, body").animate({
            scrollTop: 729
        },1000);
        return false;
    });


    dc.renderAll();
}

