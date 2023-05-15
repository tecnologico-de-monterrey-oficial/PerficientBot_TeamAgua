from flask import Flask
from GithubAPI import GithubRepos, GithubIssues, GithubPulls
from OutlookAPI import OutlookWeekEvents, OutlookMonthEvents, OutlookScheduleMeeting, OutlookAllEvents
from AzureAPI import AzureCreateItem, AzureOneItem, AzureWorkItems

app = Flask(__name__)

@app.route('/Github/Repositories')        
def getGithubRepos():
    return GithubRepos()

@app.route('/Github/Issues')       
def getGithubIssues():
    return GithubIssues()

@app.route('/Github/Pulls')   
def getGithubPulls():
    return GithubPulls()

@app.route('/Outlook/WeekEvents')
def getWeekEvents():
    return OutlookWeekEvents()  

@app.route('/Outlook/MonthEvents')
def getMonthEvents():
    return OutlookMonthEvents()

@app.route('/Outlook/ScheduleMeeting')
def postScheduleMeeting():
    return OutlookScheduleMeeting()

@app.route('/Outlook/AllEvents')
def getAllEvents():
    return OutlookAllEvents()

@app.route('/Azure/AllWI')
def getAllWI():
    return AzureWorkItems()

@app.route('/Azure/WI')
def getWI():
    return AzureOneItem()

@app.route('/Azure/CreateItem')
def postCreateItem():
    return AzureCreateItem()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)
