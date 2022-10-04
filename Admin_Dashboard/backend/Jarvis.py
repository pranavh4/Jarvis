from flask import Flask, request, render_template, jsonify, send_from_directory
import requests
from flask_cors import CORS
import os
import time
import random
import json
import subprocess


app = Flask(__name__,static_folder="build/static", template_folder="build")
CORS(app)

SNORT_FILE = "./balanced"
CUSTOM_FILE = "./local.rules"
ALERT_FILE = "./output.json"
LOG_FILE = "./slowloris alert"
SITE_FILE = "./websitelist.json"
TIME_FILE = "./times.json"

rules = []
ruleAccessTime = 0

customRules = []
customRuleAccessTime = 0

def setCustomRules():
    global customRules, customRuleAccessTime
    if len(customRules)==0:
        with open(CUSTOM_FILE,'r') as f:
            customRules = [r for r in f.readlines() if ([t for t in ['alert', 'log', 'pass', 'drop', 'reject', 'sdrop', 'activate', 'dynamic'] if t in r[:11]])]
            # print(f.readlines())
            for i in range(len(customRules)):
                status = 'Enabled'
                action = 'Alert'
                if customRules[i][0]=='#':
                    status = 'Disabled'
                if "drop" in customRules[i][:7]:
                    action = 'Drop'
                # try:
                print(customRules[i])

                sid_i = customRules[i].index(' sid:') + len(' sid:')
                # except:

                sid = int(customRules[i][sid_i:].split(';',1)[0])

                customRules[i] = {'Rule':customRules[i],'Action':action,'Status':status,'Sid':sid}
        customRules = sorted(customRules,key=lambda x:x['Sid'])
        customRuleAccessTime = int(time.time())

@app.route('/admin/dashboard')
@app.route('/admin/detected_malicious_patterns')
def home():
    return render_template('index.html')

@app.route('/api/getSnortRules', methods=['GET'])
def getRules():
    global rules,ruleAccessTime
    print(os.path.getmtime(SNORT_FILE))
    print(ruleAccessTime)
    # print(type(os.path.))
    print(ruleAccessTime<os.path.getmtime(SNORT_FILE))
    if (len(rules)>0 and ruleAccessTime<os.path.getmtime(SNORT_FILE)) or len(rules)==0:
        print("in if")
        with open(SNORT_FILE,'r') as f:
            rules = [r for r in f.readlines() if ([t for t in ['alert', 'log', 'pass', 'drop', 'reject', 'sdrop', 'activate', 'dynamic'] if t in r[:11]])]
            # print(f.readlines())
            for i in range(len(rules)):
                status = 'Enabled'
                action = 'Alert'
                if rules[i][0]=='#':
                    status = 'Disabled'
                if "drop" in rules[i][:7]:
                    action = 'Drop'
                # try:
                print(rules[i])

                sid_i = rules[i].index(' sid:') + len(' sid:')
                # except:

                sid = int(rules[i][sid_i:].split(';',1)[0])

                rules[i] = {'Rule':rules[i],'Action':action,'Status':status,'Sid':sid}
        rules = sorted(rules,key=lambda x:x['Sid'])
        ruleAccessTime = int(time.time())
    return jsonify({'status':'success','Rules':rules})

@app.route('/api/getCustomRules', methods=['GET'])
def getCustomRules():
    global customRules,customRuleAccessTime
    # print(os.path.getmtime('./balanced'))
    # print(ruleAccessTime)
    # print(type(os.path.))
    # print(customRuleAccessTime<os.path.getmtime(CUSTOM_FILE))
    if (len(customRules)>0 and customRuleAccessTime<os.path.getmtime(CUSTOM_FILE)) or len(customRules)==0:
        # print("in if")
        with open(CUSTOM_FILE,'r') as f:
            customRules = [r for r in f.readlines() if ([t for t in ['alert', 'log', 'pass', 'drop', 'reject', 'sdrop', 'activate', 'dynamic'] if t in r[:11]])]
            # print(f.readlines())
            for i in range(len(customRules)):
                status = 'Enabled'
                action = 'Alert'
                if customRules[i][0]=='#':
                    status = 'Disabled'
                if "drop" in customRules[i][:7]:
                    action = 'Drop'
                # try:
                # print(customRules[i])

                sid_i = customRules[i].index(' sid:') + len(' sid:')
                # except:

                sid = int(customRules[i][sid_i:].split(';',1)[0])

                customRules[i] = {'Rule':customRules[i],'Action':action,'Status':status,'Sid':sid}
        customRules = sorted(customRules,key=lambda x:x['Sid'])
        customRuleAccessTime = int(time.time())
    return jsonify({'status':'success','Rules':customRules})

@app.route('/api/saveRules',methods=['POST'])
def saveRules():
    rules = request.json['rules']
    type_ = request.json['type']
    deploy = request.json['deploy']
    # print(rules[:5],type_)
    with open(CUSTOM_FILE if type_=='Custom' else SNORT_FILE,'w') as f:
        for i in range(len(rules)):
            rule = rules[i]['Rule']
            if rule[-1]!='\n':
                rule+='\n'
            f.write(rule)
    
    return jsonify({'status':'success'})



@app.route('/api/getAlerts',methods=['GET'])
def getAlerts():
    global customRules, customRuleAccessTime
    alerts = []
    selected = []
    ret_alert = []

    sites = {}
    with open(SITE_FILE,'r') as f:
        sites = json.load(f)
    sites = [s['IP'] for s in sites['Sites']]

    with open(ALERT_FILE,'r') as f:
        alerts = [a for a in json.load(f)['Alerts'] if a['Detected']!='BENIGN' and a['Src'] not in sites]
    
    ret_logs = []
    with open(LOG_FILE,'r') as f:
        logs = f.readlines()
        for l in logs:
            l = l.split(' ')
            if len(l)==1:
                continue
            d_ip = l[-1].split(':')[0].strip()
            s_ip = l[-3].split(':')[0].strip()
            index = [i for i in range(len(l)) if 'Classification:' in l[i]][-1] + 1
            # print(l[index])
            attack = ""
            while l[index][-1]!="]":
                attack+=l[index] + " "
                index+=1
            attack+=l[index][:-1]
            # print(attack)
            if [s_ip,d_ip,attack] in selected:
                continue

            ret_logs.append({'Src':s_ip,'Dst':d_ip,'Detected':attack,'Snort':True})
            selected.append([s_ip,d_ip,attack])

    setCustomRules()

    selected = []
    sid = customRules[-1]['Sid'] + 1
    ind = 0
    for a in alerts:
        if [a['Src'],a['Dst'],a['Detected']] in selected:
            continue
        ret_alert.append(a)
        ret_alert[-1]['Rule'] = f'''drop tcp {a['Src']} any -> $HOME_NET any ( msg:"Malicious Pattern Detected from Model"; sid:{sid+ind};)'''
        selected.append([a['Src'],a['Dst'],a['Detected']])
        ind+=1

    return jsonify({'Alerts':ret_alert + ret_logs,'status':'success'})

@app.route('/api/addSuggestedRules',methods=['POST'])
def addSuggestedRules():
    rules = request.json['rules']
    alerts = request.json['alerts']
    print(rules)
    with open(CUSTOM_FILE,'a') as f:
        for rule in rules:
            if rule[-1]!='\n':
                rule+='\n'
            f.write(rule)
    with open(ALERT_FILE,'w') as f:
        json.dump({'Alerts':[a for a in alerts if 'Snort' not in a.keys()]},f)

    return jsonify({'status':'success'})

@app.route('/api/getDashboardData',methods=['GET'])
def getDashboardData():
    res = {}
    setCustomRules()
    res['rules'] = len(customRules)
    alerts = []

    with open(ALERT_FILE,'r') as f:
        alerts = [a for a in json.load(f)['Alerts'] if a['Detected']!='BENIGN']
    selected = []
    ret_alert = []
    for a in alerts:
        if [a['Src'],a['Dst'],a['Detected']] in selected:
            continue
        ret_alert.append(a)
        selected.append([a['Src'],a['Dst'],a['Detected']])
    res['alerts'] = len(ret_alert)

    sites = {}
    with open(SITE_FILE,'r') as f:
        sites = json.load(f)
    res['Sites'] = sorted([s for s in sites['Sites'] if s['Site'][:3]=="www"],key=lambda x:x['time'],reverse=True)

    times = {}
    with open(TIME_FILE,'r') as f:
        times = json.load(f)

    res['Traffic'] = times['Traffic']
    res['Labels'] = [str(i) for i in range(len(times['Traffic']))]
    return jsonify(res)

def deploy():
    process = subprocess.Popen(['snort', '-c', '/etc/snort/rules/local.rules', '-T', '-Q', '-q'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    process.wait()
    success = process.returncode #returns 0 if successful, any other integer otherwise (usually 1)
    print(success)
    return jsonify({})



if(__name__=="__main__"):
    app.run(debug=True,host="0.0.0.0")  