#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Apr  6 22:53:59 2020

@author: pranav
"""

import pandas as pd
import pickle

MODEL_PATH = './model.sav'

DATA_PATH = './TrafficLabelling/Tuesday-WorkingHours.pcap_ISCX.csv'

CLASSES = ['BENIGN','Bot','DDoS','DoS GoldenEye','DoS Hulk',
           'DoS Slowhttptest','DoS slowloris','FTP-Patator',
           'Heartbleed''Infiltration','PortScan','SSH-Patator',
           'Web Attack Brute Force','Web Attack XSS','Web Attack Sql Injection']

UNUSED_FEATURES = ['Flow ID',' Source IP',' Destination IP',' Timestamp',' Label']

MODEL = pickle.load(open(MODEL_PATH,'rb'))

def preprocess():
    global DATA_PATH, UNUSED_FEATURES
    data = pd.read_csv(DATA_PATH)
    print("read")
    features = [c for c in data.columns if c not in UNUSED_FEATURES]
    op_features = [' Source IP',' Source Port',' Destination IP',' Destination Port',' Timestamp']
    op_data = data[op_features]
    data = data[features]
    data = data.astype({'Flow Bytes/s': 'float32', ' Flow Packets/s': 'float32'})
    print("before inf fill")
    f_with_inf = ['Flow Bytes/s',' Flow Packets/s']
    for f in f_with_inf:
        max_val = data.loc[data[f]!=float('inf'),f].max()
        data[f].replace(float('inf'),max_val,inplace=True)
    print("before normalization")
    data = (data-data.min())/(data.max()-data.min())
    data = data.astype('float32')
    data = data.fillna(data.mean())
    print("returned")
    return (data,op_data)

def predict():
    global MODEL, CLASSES
    
    data, op_data = preprocess()
    predictions = MODEL.predict(data)
    attack_index = [i for i in range(len(predictions)) if predictions[i]!=0]
    attack_label = [CLASSES[predictions[i]] for i in attack_index]
    op_data = op_data.iloc[attack_index,:]
    op_data['Label'] = attack_label
    op_data.to_csv('Detected_Attacks.csv')
    
predict()
    

