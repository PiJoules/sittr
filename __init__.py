# Call vendor to add the dependencies to the classpath
import vendor
vendor.add('lib')


# Import the Flask Framework
from flask import Flask, render_template, url_for
app = Flask(__name__)


# Root directory
@app.route('/')
def index():
	return render_template("index.html")


if __name__ == '__main__':
    app.run(host="0.0.0.0")

