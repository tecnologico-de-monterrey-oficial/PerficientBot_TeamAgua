from flask import Flask, jsonify, request
from datetime import datetime, timedelta
import requests

app = Flask(__name__)

fullNames = []
fullNamesPull = []

CONTENT_TYPE = 'application/json'
API_GIT_KEY = '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'
API_OUT_KEY = 'eyJ0eXAiOiJKV1QiLCJub25jZSI6IjAycjQ0NVZGc1lja211Q3JCbkwxa3E0VE9lTFE0TkZlaktwaFQwYXBoaTgiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9jNjVhM2VhNi0wZjdjLTQwMGItODkzNC01YTZkYzE3MDU2NDUvIiwiaWF0IjoxNjgyNzEyMTcxLCJuYmYiOjE2ODI3MTIxNzEsImV4cCI6MTY4Mjc5ODg3MiwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFUUUF5LzhUQUFBQWM5VDJaQmZnOUpiNHJwYm5aMWdJYUlHMDBJRUE2SE1EdExLL0swMThqSUJ4a3JmSmJ6c1Rib3hPdTlBdzhCMVIiLCJhcHBfZGlzcGxheW5hbWUiOiJHcmFwaCBFeHBsb3JlciIsImFwcGlkIjoiZGU4YmM4YjUtZDlmOS00OGIxLWE4YWQtYjc0OGRhNzI1MDY0IiwiYXBwaWRhY3IiOiIwIiwiZmFtaWx5X25hbWUiOiJSYW3DrXJleiBGZXJuw6FuZGV6IiwiZ2l2ZW5fbmFtZSI6IkFuZHLDqXMgQWxlamFuZHJvIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMTMxLjE3OC4xMDIuMjAwIiwibmFtZSI6IkFuZHLDqXMgQWxlamFuZHJvIFJhbcOtcmV6IEZlcm7DoW5kZXoiLCJvaWQiOiI3MDRhYWM4YS0zMjljLTRiNjgtOGU1My04MjEzNGI1N2UwYzIiLCJvbnByZW1fc2lkIjoiUy0xLTUtMjEtMTcwODUzNzc2OC01NzM3MzU1NDYtNzI1MzQ1NTQzLTEzMTg0ODciLCJwbGF0ZiI6IjUiLCJwdWlkIjoiMTAwMzIwMDA5ODU4MDdBQiIsInJoIjoiMC5BVmNBcGo1YXhud1BDMENKTkZwdHdYQldSUU1BQUFBQUFBQUF3QUFBQUFBQUFBQlhBT1kuIiwic2NwIjoiQWNjZXNzUmV2aWV3LlJlYWQuQWxsIEFjY2Vzc1Jldmlldy5SZWFkV3JpdGUuQWxsIEFjY2Vzc1Jldmlldy5SZWFkV3JpdGUuTWVtYmVyc2hpcCBBZG1pbmlzdHJhdGl2ZVVuaXQuUmVhZC5BbGwgQWRtaW5pc3RyYXRpdmVVbml0LlJlYWRXcml0ZS5BbGwgQWdyZWVtZW50LlJlYWQuQWxsIEFncmVlbWVudC5SZWFkV3JpdGUuQWxsIEFncmVlbWVudEFjY2VwdGFuY2UuUmVhZCBBZ3JlZW1lbnRBY2NlcHRhbmNlLlJlYWQuQWxsIEFuYWx5dGljcy5SZWFkIEFwcENhdGFsb2cuUmVhZFdyaXRlLkFsbCBBcHByb3ZhbFJlcXVlc3QuUmVhZC5BZG1pbkNvbnNlbnRSZXF1ZXN0IEFwcHJvdmFsUmVxdWVzdC5SZWFkLkN1c3RvbWVyTG9ja2JveCBBcHByb3ZhbFJlcXVlc3QuUmVhZC5FbnRpdGxlbWVudE1hbmFnZW1lbnQgQXBwcm92YWxSZXF1ZXN0LlJlYWQuUHJpdmlsaWdlZEFjY2VzcyBBcHByb3ZhbFJlcXVlc3QuUmVhZFdyaXRlLkFkbWluQ29uc2VudFJlcXVlc3QgQXBwcm92YWxSZXF1ZXN0LlJlYWRXcml0ZS5DdXN0b21lckxvY2tib3ggQXBwcm92YWxSZXF1ZXN0LlJlYWRXcml0ZS5FbnRpdGxlbWVudE1hbmFnZW1lbnQgQXBwcm92YWxSZXF1ZXN0LlJlYWRXcml0ZS5Qcml2aWxpZ2VkQWNjZXNzIEJpdGxvY2tlcktleS5SZWFkLkFsbCBCaXRsb2NrZXJLZXkuUmVhZEJhc2ljLkFsbCBDYWxlbmRhcnMuUmVhZFdyaXRlIENvbnRhY3RzLlJlYWRXcml0ZSBEaXJlY3RvcnkuUmVhZC5BbGwgRmlsZXMuUmVhZFdyaXRlLkFsbCBNYWlsLlJlYWRXcml0ZSBOb3Rlcy5SZWFkV3JpdGUuQWxsIG9wZW5pZCBQZW9wbGUuUmVhZCBwcm9maWxlIFJlcG9ydHMuUmVhZC5BbGwgU2l0ZXMuRnVsbENvbnRyb2wuQWxsIFNpdGVzLk1hbmFnZS5BbGwgU2l0ZXMuUmVhZC5BbGwgU2l0ZXMuUmVhZFdyaXRlLkFsbCBUYXNrcy5SZWFkV3JpdGUgVGVhbS5SZWFkQmFzaWMuQWxsIFRlYW1NZW1iZXIuUmVhZC5BbGwgVGVhbXNBcHAuUmVhZCBUZWFtU2V0dGluZ3MuUmVhZC5BbGwgVGVhbVNldHRpbmdzLlJlYWRXcml0ZS5BbGwgVXNlci5SZWFkIFVzZXIuUmVhZC5BbGwgVXNlci5SZWFkQmFzaWMuQWxsIFVzZXIuUmVhZFdyaXRlIFVzZXIuUmVhZFdyaXRlLkFsbCBlbWFpbCIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6ImRRWXB5OXFWTW1zcjROcENQTXJhLThiWjdZa3JwTmpYOVFZVGVsZnpRS3MiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiJjNjVhM2VhNi0wZjdjLTQwMGItODkzNC01YTZkYzE3MDU2NDUiLCJ1bmlxdWVfbmFtZSI6IkEwMDgzMTMxNkB0ZWMubXgiLCJ1cG4iOiJBMDA4MzEzMTZAdGVjLm14IiwidXRpIjoiNU1UazFPUVVPVS1RcWtQa3F2bERBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiYjc5ZmJmNGQtM2VmOS00Njg5LTgxNDMtNzZiMTk0ZTg1NTA5Il0sInhtc19jYyI6WyJDUDEiXSwieG1zX3NzbSI6IjEiLCJ4bXNfc3QiOnsic3ViIjoiZmEwbUFTT043R28tWnFHc0ZxNENMRzQ0VWNpaTJkZGwzNW5CQTNKbllfTSJ9LCJ4bXNfdGNkdCI6MTM2MTk3ODU4NX0.h2yuTOW9FEcA4JrBl9FKAmYEwx3hGL4WoIl3g1DXDzrt_o6TiE25XwQknzwWFzb2C_hnBq9QEDV2-IJOVwTJewVT9a5nMklDa7RK-meG0PsLdZne68AdjbzK6r4gvB-cSjCwZNyXMzyfjfdlDB8t8PtqVEPz4ifUqRkOyAcDx0T5Z0tz0NNyVI-LrMTpcpR6PEkNnnMWxFhbFr-im3TVJ6ppwWFnIiA1Wvo9oIkgMbg78rJnKa2cOvTAfrHOB7JCWRoE-IUTkdP1FvRhiSHldZ7pOD4FLU1RH6HvCiedrKS_IKNSfRdgOknC6mho5V14c2wKw_sC_BG58yD2Mek8vg'

API_GIT_REPOS = 'https://api.github.com/user/repos'

API_OUT_POSTMEETING = 'https://graph.microsoft.com/v1.0/me/events'
API_OUT_FINDMEETING = 'https://graph.microsoft.com/v1.0/me/findMeetingTimes'

@app.route('/EasterEgg')
def index():
    return 'Agua Funciona'

@app.route('/repos', methods=['GET'])
def repos():
    headers = {'Authorization': f'Bearer {API_GIT_KEY}', 'Content-Type': CONTENT_TYPE}
    response = requests.get(API_GIT_REPOS, headers=headers)

    if response.status_code == 200:
        json_response = response.json()
        names = []
        for item in json_response:
            names.append(item.get('name'))
            fullName = item.get('full_name')
            fullNamesPull.append('full_name')
            if item.get('open_issues')!= 0:
                fullNames.append(fullName)
        return names
    else:
        return 'Error: unable to retrieve data from external API'
 
@app.route('/issuesYpulls', methods=['GET'])
def issueCall():
    jsons = []
    for i in fullNames:
        for item in issues(i):
            if(item.get('draft')==False or item.get('draft')==True):
                jsons.append({
                    "Nombre": i,
                    "Tipo": "Pull",
                    "Titulo": item.get('title'),
                    "Descripción": item.get('body'),
                })
            else:
                jsons.append({
                    "Nombre": i,
                    "Tipo": "Issue",
                    "Titulo": item.get('title'),
                    "Descripción": item.get('body'),
                })
    return jsons

def issues(fullNameValue):
    headers = {'Authorization': f'Bearer {API_GIT_KEY}', 'Content-Type': CONTENT_TYPE}
    response = requests.get(f'https://api.github.com/repos/{fullNameValue}/issues', headers=headers)

    if response.status_code == 200:
        data = response.json()
        return data
    else:
        return 'Error: unable to retrieve data from external API'
    
@app.route('/weekevents', methods=['GET'])
def weekevents():
    current_date = datetime.now()
    next_week = current_date + timedelta(weeks=1)

    headers = {'Authorization': f'Bearer {API_OUT_KEY}', 'Content-Type': CONTENT_TYPE}
    response = requests.get(f'https://graph.microsoft.com/v1.0/me/calendarview?startdatetime={current_date}Z&enddatetime={next_week}', headers=headers)

    if response.status_code == 200:
        json_response = response.json()
        subjects = []
        i = 0
        for item in json_response:
            subjects.append(json_response['value'][i]['subject'])
            i+=1
        return subjects
    else:
        return 'Error: unable to retrieve data from external API ' + response.text
    
@app.route('/schedulemeeting', methods=['POST'])
def meeting():
    headers = {'Authorization': f'Bearer {API_OUT_KEY}', 'Content-Type': CONTENT_TYPE}

    subject = request.json.get('subject')
    dateStart = request.json.get('dateStart')
    dateEnd = request.json.get('dateEnd')
    
    #Date debe estar en este formato: "2023-05-05T00:05:42.099Z"
    data = {
        "subject": subject,
        "start": {
            "dateTime": dateStart,
            "timeZone": "UTC"
        },
        "end": {
            "dateTime": dateEnd,
            "timeZone": "UTC"
        }
    }
    response = requests.post(API_OUT_POSTMEETING, headers=headers, json=data)
    if response.status_code == 201:
        response_data = {'message': 'Event created successfully.'}
        return response_data
        print('Event created successfully.')
    else:
        response_data = {'message': 'Event failed to be created.'}
        return response_data
        print('Error creating event: ', response.text)

if __name__ == '__main__':
    app.run(host='0.0.0.0')