# Movie Deaths Dashboard

An exercise in Data Visualisation, using a dataset which focuses on the number of deaths that take place in movies.

It is possible to filter results by Year, Director, Genre, MPAA Rating, and Deaths per Minute.

All instructions on how to use this dashboard can be found within the hosted application by clicking on the 'Start Here' button.

## Qualification
Due to the limited nature of the dataset (422 movies from 1949 to 2010) it is not possible to infer too much hard fact from analysis.

This is meant purely as a learning exercise, displaying some of the features of dc.js and crossfilter.js, and aiming to increase my own knowledge of working with the Flask framework and json data.

## Getting Started

### Prerequisites

No installation is necessary to view this app online.
A live version of this dashboard is hosted [here](https://com-movie-dashboard.herokuapp.com/) on Heroku.

If you wish to test/develop this app locally, clone this repo and use the following guidelines:

### Python
You must have Python 2.7 installed on your system, available [here](https://www.python.org/).
Download the correct version for your operating system and follow the installation instructions.

### requirements.txt
Create and activate a local virtual environment and pip install -r requirements.txt

### Local Server
Run your app using the following commands in command line:
$ export FLASK_APP=stream2_project.py
$ flask run
Navigate to http://localhost:5000/ to view your app locally

## Built With

- [Flask](http://flask.pocoo.org/) - a lightweight Python web framework based on Werkzeug and Jinja 2
- [dc.js](https://dc-js.github.io/dc.js/) - JavaScript Library for Multi-Dimensional Charting
- [intro.js](http://introjs.com) - step-by-step guide and feature introduction
- [MongoDB](https://www.mongodb.com/) - cross-platform document-oriented NoSQL database program

## Inspiration

There are a number of websites dedicated to the meticulous counting and visualisation of on-screen deaths.
- [moviebodycounts.com](http://www.moviebodycounts.com/)
- [randalolson.com](http://www.randalolson.com/2013/12/31/deadliest-films-of-all-time-by-on-screen-death-counts/) - put this dataset together

The greatest amount of credit for the inspiration for this dashboard goes to [ramiro.org](http://ramiro.org/notebook/movie-body-counts/) who created a broadly similar visualisation using different technologies with which I am not familiar (pandas, NumPy and matplotlib).

## Responsiveness
As of this point, this dashboard is not responsive due to limitations in dc.js.
The website is optimised to be viewed on a 2016 15" MacBook Pro, and will not render correctly on any other screensize.

## Testing
Manual testing was undertaken for every feature of the website and satisfactorily passed.

## Author
Brendan Long

## License
This project is licensed under the MIT License.

## Acknowledgments
- [Start Bootstrap - Agency Theme](https://startbootstrap.com/template-overviews/agency/)
