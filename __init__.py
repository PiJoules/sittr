# Call vendor to add the dependencies to the classpath
import vendor
vendor.add('lib')


# Import the Flask Framework
from flask import Flask, render_template, url_for
app = Flask(__name__)

import requests


# Root directory
@app.route('/')
def index():
	return render_template("index.html")


"""
Find a random gif using the giphy api
"""
@app.route("/rand")
def rand_route():
	r = requests.get("http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC")
	result = r.json()
	return result["data"]["image_url"]


if __name__ == '__main__':
	#app.run(host="0.0.0.0") # For development
    app.run() # For prod

