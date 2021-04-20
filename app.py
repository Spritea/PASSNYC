from flask import Flask, render_template, request
import json
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.manifold import MDS
from sklearn.metrics import pairwise_distances
app = Flask(__name__)


@app.route('/')
def index():
    # return 'Hello World!'
    return render_template("index.html")



if __name__ == '__main__':
    app.run()
