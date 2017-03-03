from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json

app = Flask(__name__)

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'movieDeaths'
COLLECTION_NAME = 'projects'


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/movieDeaths/projects')
def movie_deaths_projects():

    fields = {
        '_id': False,
        'Film': True,
        'Year': True,
        'Body_Count': True,
        'MPAA_Rating': True,
        'Genre': True,
        'Director': True,
        'Length_Minutes': True,
        'IMDB_Rating': True
    }

    with MongoClient(MONGODB_HOST, MONGODB_PORT) as conn:
        collection = conn[DBS_NAME][COLLECTION_NAME]
        projects = collection.find(projection=fields, limit=10000)
        return json.dumps(list(projects))


if __name__ == '__main__':
    app.run(debug=True)
