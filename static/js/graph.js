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
    // var numMoviesByYear = yearDim.group(); // -- DEEMED THIS CHART UNNECESSARY AFTER I CREATED IT, KEEPING CODE FOR POSSIBLE LATER USE -- //

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


    var numberFormat = d3.format(".1f"); // applying this var to numbers reduces the value to 1 decimal place

    var mpaaRating = mpaaDim.group();

    var genreGroup = genreDim.group();


    // -- DEEMED THIS CHART UNNECESSARY AFTER I CREATED IT, KEEPING CODE FOR POSSIBLE LATER USE -- //
    // -- Define values (to be used in charts) -- //
    // var minYear = yearDim.bottom(1)[0]["Year"];
    // var maxYear = yearDim.top(1)[0]["Year"];


    // -- Charts -- //

    // var moviesPerYearChart = dc.barChart("#year-movie-chart");     // -- DEEMED THIS CHART UNNECESSARY AFTER I CREATED IT, KEEPING CODE FOR POSSIBLE LATER USE -- //
    var avgDeathsPerYearChart = dc.rowChart("#year-death-chart");
    var deathsPerMovieChart = dc.rowChart("#deaths-movie-chart");
    var deathsPerMinuteChart = dc.rowChart("#deaths-minute-chart");
    var deathsPerDirectorChart = dc.rowChart("#deaths-director-chart");
    var deathsPerMinuteDirectorChart = dc.rowChart("#deaths-minute-director-chart");
    var bodyCountIMDBChart = dc.bubbleChart("#body-imdb-chart");
    var movieGenresPie = dc.pieChart("#genre-chart");
    var mpaaRatingPie = dc.pieChart("#genre-chart-2");


    avgDeathsPerYearChart // -- RowChart -- //
        .width(520)
        .height(870)
        .margins({top: 10, right: 30, bottom: 30, left: 30})
        .colors("#d8a400")
        .dimension(yearDim)
        .group(avgDeathsPerYear)
        .transitionDuration(1500)
        .elasticX(true)
        .valueAccessor(function (p) {
            return Math.round((p.value.average * 10) / 10); // Rounds to whole number
        });


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
                + "Body Count: " + numberFormat(p.value.body_count)
                + "\n"
                + "IMDB Rating: " + numberFormat(p.value.imdb_rating)
        });
    bodyCountIMDBChart.yAxis().tickFormat(function (s) {
        return s;
    });
    bodyCountIMDBChart.xAxis().tickFormat(function (s) {
        return s;
    });


    deathsPerMovieChart // -- RowChart -- //
        .width(820)
        .height(225)
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


    deathsPerDirectorChart // -- RowChart -- //
        .width(800)
        .height(225)
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


    deathsPerMinuteChart // -- RowChart -- //
        .width(820)
        .height(225)
        .margins({top: 5, right: 30, bottom: 20, left: 30})
        .ordinalColors(["#960000", "#9d2001", "#aa4000", "#b75d00", "#c27300", "#c77e00", "#cc8b00", "#d29700", "#d8a400", "#deb300"])
        .elasticX(true)
        .dimension(movieDim)
        .group(numDeathsPerMinute)
        .transitionDuration(1500)
        .xAxis().ticks(10);
    deathsPerMinuteChart.ordering(function (d) { // Orders results in reverse
        return -d.value
    });
    deathsPerMinuteChart.rowsCap([10]); // Caps the results at 10
    deathsPerMinuteChart.othersGrouper(false); // Everything after first 10 results is stored in a group called others, this prevents that group being shown


    deathsPerMinuteDirectorChart // -- RowChart -- //
        .width(800)
        .height(225)
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
        .radius(150)
        .width(525)
        .height(300)
        .transitionDuration(1500)
        .dimension(genreDim)
        .ordinalColors(["#ddc32c", "#deb300", "#d8a400", "#d29700", "#cc8b00", "#c77e00", "#c27300", "#b75d00", "#aa4000", "#9d2001", "#990000", "#AA0000"])
        .group(genreGroup)
        .renderLabel(true)
        .minAngleForLabel(.01)
        .externalLabels(-30);
    movieGenresPie.ordering(function (d) {
        return +d.value
    });
    movieGenresPie.slicesCap([11]);


    mpaaRatingPie // -- PieChart -- //
        .radius(150)
        .width(525)
        .height(300)
        .transitionDuration(1500)
        .dimension(mpaaDim)
        .group(mpaaRating)
        .ordinalColors(["#c77e00", "#b75d00", "#aa4000", "#9d2001", "#AA0000"])
        .renderLabel(true)
        .minAngleForLabel(.01)
        .externalLabels(-30);


    // moviesPerYearChart // -- BarChart -- //     // -- DEEMED THIS CHART UNNECESSARY AFTER I CREATED IT, KEEPING CODE FOR POSSIBLE LATER USE -- //
    //     .width(820)
    //     .height(200)
    //     .margins({top: 10, right: 30, bottom: 30, left: 30})
    //     .colors("#a10300")
    //     .dimension(yearDim)
    //     .group(numMoviesByYear)
    //     .transitionDuration(1500)
    //     .x(d3.scale.ordinal().domain([(minYear), (maxYear)]))
    //     .xUnits(dc.units.ordinal)
    //     .elasticX(true)
    //     .elasticY(true)
    //     .yAxis().ticks(10);


    // -- jQuery for scrolling to set points -- //

    // This function was required to overcome an issue whereby the 'back to top' button appeared when the page was first loaded. It would disappear after scrolling down 1px and then resume expected functionality
    $(window).scroll(function () {
        if ($(this).scrollTop() > 800) {
            $('.scrollUp').removeClass('hidden');
        }
    });

    // This function only allows 'back to top' button to appear after scrolling down the page.
    $(window).scroll(function () {
        if ($(this).scrollTop() > 800) {
            $('.scrollUp').fadeIn();
        } else {
            $('.scrollUp').fadeOut();
        }
    });


    // Edited scrolling in intro.js (1075) to avoid jerky page movement when scrollTo functionality is implemented

    // Edited padding intro.js (70) to ensure complete graph showed in tooltips


    $('.scrollUp').click(function () {
        $("html, body").animate({
            scrollTop: 729
        }, 1000);
        return false;
    });


    dc.renderAll();
}

