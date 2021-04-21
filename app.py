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

class My_PCA:
    def __init__(self,csv_file,label_col):
        self.data_out=self.change_percent(self.remove_cat(csv_file))
        self.original_df,self.pca_components=self.compute_PCA(self.data_out)
        self.label,self.label_unique=self.get_data_label(csv_file,label_col)

    def get_data_label(self,csv_file,label_col):
        df_in = pd.read_csv(csv_file)
        # cat_list = ["City", "Rigorous Instruction Rating", "Collaborative Teachers Rating",
        #             "Supportive Environment Rating", "Effective School Leadership Rating",
        #             "Strong Family-Community Ties Rating","Trust Rating","Student Achievement Rating"]
        label=list(df_in[label_col])
        label_unique = list(np.unique(df_in[label_col]))
        return label,label_unique
    def remove_cat(self,csv_file):
        df_in = pd.read_csv(csv_file)
        cat_list = ["City", "Rigorous Instruction Rating", "Collaborative Teachers Rating",
                    "Supportive Environment Rating", "Effective School Leadership Rating",
                    "Strong Family-Community Ties Rating","Trust Rating","Student Achievement Rating"]
        df_out = df_in.drop(cat_list, axis=1)
        return df_out

    #transform percent to decimal.
    def change_percent(self,csv_data):
        percent_list = ["Percent ELL", "Student Attendance Rate", "Percent of Students Chronically Absent",
                    "Rigorous Instruction %", "Collaborative Teachers %","Supportive Environment %",
                    "Effective School Leadership %","Strong Family-Community Ties %","Trust %",]
        trans_func=lambda col: col.str.strip('%').astype(float)/100
        csv_data[percent_list]=csv_data[percent_list].apply(trans_func,axis=1)
        return csv_data

    def compute_PCA(self,df):
        StandScaler = StandardScaler()
        #no set n_components, it would save all components.
        pca = PCA(random_state=0)
        original_df = pca.fit_transform(StandScaler.fit_transform(df))
        # pca_percent = 100 * pca.explained_variance_ratio_
        # pca_cum_sum_var = np.cumsum(pca_percent)
        return original_df,pca.components_


pca_class=My_PCA(csv_file='school_data_clean_v2.csv', label_col="City")
print('kk')

df_ori = pd.read_csv('school_data_clean_v2.csv')
df_pcp = pca_class.change_percent(df_ori)
pcp_columns = ["City", "Rigorous Instruction Rating", "Collaborative Teachers Rating", "Student Attendance Rate", "Student Achievement Rating",
 "Average ELA Proficiency", "Average Math Proficiency"]

@app.route('/')
def index():
    # return 'Hello World!'
    return render_template("index.html")

@app.route("/plotTop2PCA", methods=['POST', 'GET'])
def plotTop2OriginalPCA():
    if request.method == 'POST':
        points_data = list(zip(pca_class.original_df[:, 0], pca_class.original_df[:, 1],pca_class.label))
        axis_data = list(zip(pca_class.pca_components[0, :], pca_class.pca_components[1, :]))
        return json.dumps([points_data, axis_data,pca_class.label_unique])

@app.route("/barchart", methods=['POST', 'GET'])
def barchart():
    if request.method == 'POST':
        city_hist = df_ori['City'].value_counts().to_dict()
        # print(city_hist)
        # city = []
        # num = []
        # for key, value in city_hist.items():
        #     city.append(key)
        #     num.append(value)
        # resp = dict(
        #     city=city,
        #     freq=num
        # )
        resp = []
        for key, value in city_hist.items():
            resp.append(dict(
                city=key,
                num=value))
        return json.dumps(resp)

@app.route('/pcp', methods=['POST', 'GET'])
def pcp():
    if request.method == 'POST':
        resp = dict(
            data = df_pcp.loc[:, pcp_columns].to_json(orient = "index"),
            column_name = pcp_columns,
            city = df_pcp.loc[:, 'City'].tolist()
        )
        return json.dumps(resp)

if __name__== "__main__":
    app.run(host='127.0.0.1', port=80, debug=True)