from flask import Flask
from flask_cors import CORS
import aiohttp
import asyncio
from GithubAPI import GithubRepos, GithubIssues, GithubPulls
from OutlookAPI import OutlookWeekEvents, OutlookMonthEvents, OutlookScheduleMeeting, OutlookAllEvents, OutlookGroups, OutlookDelete, OutlookFindMeetingTime
from AzureAPI import AzureCreateItem, AzureOneItem, AzureWorkItems
from CVAPI import getCV, getGPTtext, upload
from dbApi import obtener_usuarios, guardar_usuario, check_if_user_is_hr

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/upload/<user_id>', methods=['POST'])
def uploadCV(user_id):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(upload(user_id))
    return result

@app.route('/CV/<user_id>', methods=['GET'])
def getCVimg(user_id):
    return getCV(user_id)

@app.route('/GPTtext/<user_id>', methods=['GET'])
def getSummary(user_id):
    return getGPTtext(user_id)

# Input: N/A
""" Output: {
        "allow_forking": true,
        "archive_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/{archive_format}{/ref}",
        "archived": false,
        "assignees_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/assignees{/user}",
        "blobs_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/git/blobs{/sha}",
        "branches_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/branches{/branch}",
        "clone_url": "https://github.com/AndresA6180/Equipo-ITC.git",
        "collaborators_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/collaborators{/collaborator}",
        "comments_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/comments{/number}",
        "commits_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/commits{/sha}",
        "compare_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/compare/{base}...{head}",
        "contents_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/contents/{+path}",
        "contributors_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/contributors",
        "created_at": "2022-03-30T14:27:55Z",
        "default_branch": "main",
        "deployments_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/deployments",
        "description": null,
        "disabled": false,
        "downloads_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/downloads",
        "events_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/events",
        "fork": false,
        "forks": 0,
        "forks_count": 0,
        "forks_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/forks",
        "full_name": "AndresA6180/Equipo-ITC",
        "git_commits_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/git/commits{/sha}",
        "git_refs_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/git/refs{/sha}",
        "git_tags_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/git/tags{/sha}",
        "git_url": "git://github.com/AndresA6180/Equipo-ITC.git",
        "has_discussions": false,
        "has_downloads": true,
        "has_issues": true,
        "has_pages": false,
        "has_projects": true,
        "has_wiki": true,
        "homepage": null,
        "hooks_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/hooks",
        "html_url": "https://github.com/AndresA6180/Equipo-ITC",
        "id": 475915957,
        "is_template": false,
        "issue_comment_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/issues/comments{/number}",
        "issue_events_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/issues/events{/number}",
        "issues_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/issues{/number}",
        "keys_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/keys{/key_id}",
        "labels_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/labels{/name}",
        "language": null,
        "languages_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/languages",
        "license": null,
        "merges_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/merges",
        "milestones_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/milestones{/number}",
        "mirror_url": null,
        "name": "Equipo-ITC",
        "node_id": "R_kgDOHF3mtQ",
        "notifications_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/notifications{?since,all,participating}",
        "open_issues": 1,
        "open_issues_count": 1,
        "owner": {
            "avatar_url": "https://avatars.githubusercontent.com/u/75439965?v=4",
            "events_url": "https://api.github.com/users/AndresA6180/events{/privacy}",
            "followers_url": "https://api.github.com/users/AndresA6180/followers",
            "following_url": "https://api.github.com/users/AndresA6180/following{/other_user}",
            "gists_url": "https://api.github.com/users/AndresA6180/gists{/gist_id}",
            "gravatar_id": "",
            "html_url": "https://github.com/AndresA6180",
            "id": 75439965,
            "login": "AndresA6180",
            "node_id": "MDQ6VXNlcjc1NDM5OTY1",
            "organizations_url": "https://api.github.com/users/AndresA6180/orgs",
            "received_events_url": "https://api.github.com/users/AndresA6180/received_events",
            "repos_url": "https://api.github.com/users/AndresA6180/repos",
            "site_admin": false,
            "starred_url": "https://api.github.com/users/AndresA6180/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/AndresA6180/subscriptions",
            "type": "User",
            "url": "https://api.github.com/users/AndresA6180"
        },
        "permissions": {
            "admin": false,
            "maintain": false,
            "pull": true,
            "push": true,
            "triage": true
        },
        "private": true,
        "pulls_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/pulls{/number}",
        "pushed_at": "2022-04-27T15:56:04Z",
        "releases_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/releases{/id}",
        "size": 3,
        "ssh_url": "git@github.com:AndresA6180/Equipo-ITC.git",
        "stargazers_count": 0,
        "stargazers_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/stargazers",
        "statuses_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/statuses/{sha}",
        "subscribers_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/subscribers",
        "subscription_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/subscription",
        "svn_url": "https://github.com/AndresA6180/Equipo-ITC",
        "tags_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/tags",
        "teams_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/teams",
        "topics": [],
        "trees_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/git/trees{/sha}",
        "updated_at": "2022-03-30T14:27:55Z",
        "url": "https://api.github.com/repos/AndresA6180/Equipo-ITC",
        "visibility": "private",
        "watchers": 0,
        "watchers_count": 0,
        "web_commit_signoff_required": false
    },"""
@app.route('/Github/Repositories')        
def getGithubRepos():
    return GithubRepos()

# Input: N/A
""" Output: {
        "active_lock_reason": null,
        "assignee": null,
        "assignees": [],
        "author_association": "OWNER",
        "body": "Prueba que el issue api funciona",
        "closed_at": null,
        "comments": 0,
        "comments_url": "https://api.github.com/repos/AndresR4601/OpenAI/issues/3/comments",
        "created_at": "2023-04-10T20:39:34Z",
        "events_url": "https://api.github.com/repos/AndresR4601/OpenAI/issues/3/events",
        "html_url": "https://github.com/AndresR4601/OpenAI/issues/3",
        "id": 1661331168,
        "labels": [],
        "labels_url": "https://api.github.com/repos/AndresR4601/OpenAI/issues/3/labels{/name}",
        "locked": false,
        "milestone": null,
        "node_id": "I_kwDOJLth4s5jBebg",
        "number": 3,
        "performed_via_github_app": null,
        "reactions": {
            "+1": 0,
            "-1": 0,
            "confused": 0,
            "eyes": 0,
            "heart": 0,
            "hooray": 0,
            "laugh": 0,
            "rocket": 0,
            "total_count": 0,
            "url": "https://api.github.com/repos/AndresR4601/OpenAI/issues/3/reactions"
        },
        "repository_url": "https://api.github.com/repos/AndresR4601/OpenAI",
        "state": "open",
        "state_reason": null,
        "timeline_url": "https://api.github.com/repos/AndresR4601/OpenAI/issues/3/timeline",
        "title": "PruebaI",
        "updated_at": "2023-04-10T20:39:34Z",
        "url": "https://api.github.com/repos/AndresR4601/OpenAI/issues/3",
        "user": {
            "avatar_url": "https://avatars.githubusercontent.com/u/75329419?v=4",
            "events_url": "https://api.github.com/users/AndresR4601/events{/privacy}",
            "followers_url": "https://api.github.com/users/AndresR4601/followers",
            "following_url": "https://api.github.com/users/AndresR4601/following{/other_user}",
            "gists_url": "https://api.github.com/users/AndresR4601/gists{/gist_id}",
            "gravatar_id": "",
            "html_url": "https://github.com/AndresR4601",
            "id": 75329419,
            "login": "AndresR4601",
            "node_id": "MDQ6VXNlcjc1MzI5NDE5",
            "organizations_url": "https://api.github.com/users/AndresR4601/orgs",
            "received_events_url": "https://api.github.com/users/AndresR4601/received_events",
            "repos_url": "https://api.github.com/users/AndresR4601/repos",
            "site_admin": false,
            "starred_url": "https://api.github.com/users/AndresR4601/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/AndresR4601/subscriptions",
            "type": "User",
            "url": "https://api.github.com/users/AndresR4601"
        }
    }"""
@app.route('/Github/Issues')       
def getGithubIssues():
    return GithubIssues()

# Input: N/A
""" Output: {
        "active_lock_reason": null,
        "assignee": null,
        "assignees": [],
        "author_association": "COLLABORATOR",
        "body": "Creé una carpeta para guardar las páginas",
        "closed_at": null,
        "comments": 0,
        "comments_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/issues/1/comments",
        "created_at": "2022-04-27T14:46:50Z",
        "draft": false,
        "events_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/issues/1/events",
        "html_url": "https://github.com/AndresA6180/Equipo-ITC/pull/1",
        "id": 1217467249,
        "labels": [],
        "labels_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/issues/1/labels{/name}",
        "locked": false,
        "milestone": null,
        "node_id": "PR_kwDOHF3mtc424YSX",
        "number": 1,
        "performed_via_github_app": null,
        "pull_request": {
            "diff_url": "https://github.com/AndresA6180/Equipo-ITC/pull/1.diff",
            "html_url": "https://github.com/AndresA6180/Equipo-ITC/pull/1",
            "merged_at": null,
            "patch_url": "https://github.com/AndresA6180/Equipo-ITC/pull/1.patch",
            "url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/pulls/1"
        },
        "reactions": {
            "+1": 0,
            "-1": 0,
            "confused": 0,
            "eyes": 0,
            "heart": 0,
            "hooray": 0,
            "laugh": 0,
            "rocket": 0,
            "total_count": 0,
            "url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/issues/1/reactions"
        },
        "repository_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC",
        "state": "open",
        "state_reason": null,
        "timeline_url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/issues/1/timeline",
        "title": "Creación de carpeta y página",
        "updated_at": "2022-04-27T15:56:04Z",
        "url": "https://api.github.com/repos/AndresA6180/Equipo-ITC/issues/1",
        "user": {
            "avatar_url": "https://avatars.githubusercontent.com/u/101297050?v=4",
            "events_url": "https://api.github.com/users/Daniel-Ev-Esc/events{/privacy}",
            "followers_url": "https://api.github.com/users/Daniel-Ev-Esc/followers",
            "following_url": "https://api.github.com/users/Daniel-Ev-Esc/following{/other_user}",
            "gists_url": "https://api.github.com/users/Daniel-Ev-Esc/gists{/gist_id}",
            "gravatar_id": "",
            "html_url": "https://github.com/Daniel-Ev-Esc",
            "id": 101297050,
            "login": "Daniel-Ev-Esc",
            "node_id": "U_kgDOBgmrmg",
            "organizations_url": "https://api.github.com/users/Daniel-Ev-Esc/orgs",
            "received_events_url": "https://api.github.com/users/Daniel-Ev-Esc/received_events",
            "repos_url": "https://api.github.com/users/Daniel-Ev-Esc/repos",
            "site_admin": false,
            "starred_url": "https://api.github.com/users/Daniel-Ev-Esc/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/Daniel-Ev-Esc/subscriptions",
            "type": "User",
            "url": "https://api.github.com/users/Daniel-Ev-Esc"
        }
    },"""
@app.route('/Github/Pulls')   
def getGithubPulls():
    return GithubPulls()

# Input: N/A
""" Output: [    "dl-mty-Sin-Confirmar-Tec21@servicios.itesm.mx",
    "revistacultural.mty",
    "PROFESIONAL CON PLAN TOTAL",
    "Reflekto MTY Alinna",
    "ECOA verano 2020",
    "CGG-AlumnosTec21",
    "CGG-INS_escuelaIN",
    "CGG-INS_campusA",
    "CGG-INS_sedeMTY",
    "CGG-INS_campusA_N05",
    "CGG-Becados_INS",
    "All Users",
    "CGG-INS_sedeMTY_N05",
    "CGG-MTY-Alumnos",
    "AA20 Asesor Académico Rafael Dávalos",
    "dl-cirn_alumnos_tec21",
    "Programas Internacionales Tec21",
    "Profesional Tec21 Gen2020",
    "Alumnos Profesional Tec21 FJ21",
    "dl-mty-cvc-ict-1-4",
    "Alumnos Plan Tec21",
    "Salud Integral y Bienestar Población HMS",
    "Postal Facturas Campus MTY",
    "TC1030 POO Mayo21",
    "Alumnos FJ21 sin B2",
    "Alumnos Profesional Tec21 Ver21",
    "Extensión Nivelación FJ21",
    "avisos estudiantes",
    "ITC 19",
    "ICT 19",
    "Ing.Computación y Tec.de aplica",
    "Escuela de Ingeniería y Ciencia T21",
    "Requerimiento_Ago-Dic21",
    "Fundamentación de Sistemas B FJ22",
    "dl-mty-cvdp-itc-5_9@servicios.itesm.mx",
    "dl-alumnostec21mty_profesional",
    "ICT_ITC19",
    "TC3004B/TC3005B - FJ23",
    "CGG-INS_PIS",
    "CGG-INS_N05"
]"""
@app.route('/Outlook/Groups')
def getOutlookGroups():
    return OutlookGroups()

"""
{
    "emailAddress": {"address": "A00831316@tec.mx"},
    "startDateTime": "2023-05-24T09:00:00",
    "finishDateTime": "2023-05-26T09:00:00",
    "duration": "PT1H"
}
"""
@app.route('/Outlook/FindTime', methods=['POST'])
def getOutlookFreeTime():
    return OutlookFindMeetingTime()

""" Input: 
{
    "id" = "EventIDGoesHere"
}
"""
# Output: Event deleted successfully or Failed to delete event
@app.route('/Outlook/deleteMeeting', methods=['DELETE'])
def deleteMeeting():
    return OutlookDelete()

# Input: N/A
""" Output: {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('704aac8a-329c-4b68-8e53-82134b57e0c2')/calendarView",
    "value": [
        {
            "@odata.etag": "W/\"t5fwgoycjEqBDX35U1KHwwADFm21fw==\"",
            "allowNewTimeProposals": true,
            "attendees": [
                {
                    "emailAddress": {
                        "address": "david.cantu.delgado@tec.mx",
                        "name": "David Alonso Cantú Delgado"
                    },
                    "status": {
                        "response": "none",
                        "time": "0001-01-01T00:00:00Z"
                    },
                    "type": "required"
                },
                {
                    "emailAddress": {
                        "address": "A00227714@tec.mx",
                        "name": "José Miguel Beltrán Cinco"
                    },
                    "status": {
                        "response": "accepted",
                        "time": "0001-01-01T00:00:00Z"
                    },
                    "type": "required"
                },
                {
                    "emailAddress": {
                        "address": "A01411625@tec.mx",
                        "name": "Juan Daniel Rodríguez Oropeza"
                    },
                    "status": {
                        "response": "accepted",
                        "time": "0001-01-01T00:00:00Z"
                    },
                    "type": "required"
                },
                {
                    "emailAddress": {
                        "address": "A01745465@tec.mx",
                        "name": "Favio Mariano Dileva Charles"
                    },
                    "status": {
                        "response": "notResponded",
                        "time": "0001-01-01T00:00:00Z"
                    },
                    "type": "required"
                },
                {
                    "emailAddress": {
                        "address": "A00831316@tec.mx",
                        "name": "Andrés Alejandro Ramírez Fernández"
                    },
                    "status": {
                        "response": "notResponded",
                        "time": "0001-01-01T00:00:00Z"
                    },
                    "type": "required"
                },
                {
                    "emailAddress": {
                        "address": "A01197647@tec.mx",
                        "name": "Diego Acevedo Villarreal"
                    },
                    "status": {
                        "response": "notResponded",
                        "time": "0001-01-01T00:00:00Z"
                    },
                    "type": "required"
                }
            ],
            "body": {
                "content": "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\r\n<meta name=\"Generator\" content=\"Microsoft Exchange Server\">\r\n<!-- converted from text -->\r\n<style><!-- .EmailQuote { margin-left: 1pt; padding-left: 4pt; border-left: #800000 2px solid; } --></style></head>\r\n<body>\r\n<font size=\"2\"><span style=\"font-size:11pt;\"><div class=\"PlainText\">Lo vamos a ver en clase</div></span></font>\r\n</body>\r\n</html>\r\n",
                "contentType": "html"
            },
            "bodyPreview": "Lo vamos a ver en clase",
            "categories": [],
            "changeKey": "t5fwgoycjEqBDX35U1KHwwADFm21fw==",
            "createdDateTime": "2023-05-17T15:34:58.1981771Z",
            "end": {
                "dateTime": "2023-05-18T19:00:00.0000000",
                "timeZone": "UTC"
            },
            "hasAttachments": false,
            "hideAttendees": false,
            "iCalUId": "040000008200E00074C5B7101A82E00807E7051266084331C36CD9010000000000000000100000004E1AB66B32121C4B821DCB18DFB8D9CE",
            "id": "AAMkAGVjNWMzYmRkLTlmODItNDYzZi05YTY2LWJmNGNhM2QxYzAwNgFRAAgI21cy0tHAAEYAAAAASIOjLRpSQkuiVZ2UMuhiewcAt5fwgoycjEqBDX35U1KHwwAAAAABDQAAt5fwgoycjEqBDX35U1KHwwAC-fbzvQAAEA==",
            "importance": "high",
            "isAllDay": false,
            "isCancelled": true,
            "isDraft": false,
            "isOnlineMeeting": true,
            "isOrganizer": false,
            "isReminderOn": true,
            "lastModifiedDateTime": "2023-05-17T15:34:58.2975285Z",
            "location": {
                "displayName": "Microsoft Teams Meeting",
                "locationType": "default",
                "uniqueId": "Microsoft Teams Meeting",
                "uniqueIdType": "private"
            },
            "locations": [
                {
                    "displayName": "Microsoft Teams Meeting",
                    "locationType": "default",
                    "uniqueId": "Microsoft Teams Meeting",
                    "uniqueIdType": "private"
                }
            ],
            "occurrenceId": "OID.AAMkAGVjNWMzYmRkLTlmODItNDYzZi05YTY2LWJmNGNhM2QxYzAwNgBGAAAAAABIg6MtGlJCS6JVnZQy6GJ7BwC3l-CCjJyMSoENfflTUofDAAAAAAENAAC3l-CCjJyMSoENfflTUofDAAL99vO9AAA=.2023-05-18",
            "onlineMeeting": {
                "joinUrl": "https://teams.microsoft.com/l/meetup-join/19%3ameeting_NGU0M2ZiN2UtZmE1Yi00ZmVjLTk0OGYtMzFjMmNkY2E2YWMx%40thread.v2/0?context=%7b%22Tid%22%3a%22c65a3ea6-0f7c-400b-8934-5a6dc1705645%22%2c%22Oid%22%3a%22ebaf21f6-b556-4a31-8e30-c95fb8fc4fc0%22%7d"
            },
            "onlineMeetingProvider": "teamsForBusiness",
            "onlineMeetingUrl": "",
            "organizer": {
                "emailAddress": {
                    "address": "david.cantu.delgado@tec.mx",
                    "name": "David Alonso Cantú Delgado"
                }
            },
            "originalEndTimeZone": "Central Standard Time (Mexico)",
            "originalStartTimeZone": "Central Standard Time (Mexico)",
            "recurrence": null,
            "reminderMinutesBeforeStart": 15,
            "responseRequested": true,
            "responseStatus": {
                "response": "notResponded",
                "time": "0001-01-01T00:00:00Z"
            },
            "sensitivity": "normal",
            "seriesMasterId": "AAMkAGVjNWMzYmRkLTlmODItNDYzZi05YTY2LWJmNGNhM2QxYzAwNgBGAAAAAABIg6MtGlJCS6JVnZQy6GJ7BwC3l-CCjJyMSoENfflTUofDAAAAAAENAAC3l-CCjJyMSoENfflTUofDAAL99vO9AAA=",
            "showAs": "free",
            "start": {
                "dateTime": "2023-05-18T18:45:00.0000000",
                "timeZone": "UTC"
            },
            "subject": "Canceled: Seguimiento a Proyecto Agua",
            "transactionId": null,
            "type": "exception",
            "webLink": "https://outlook.office365.com/owa/?itemid=AAMkAGVjNWMzYmRkLTlmODItNDYzZi05YTY2LWJmNGNhM2QxYzAwNgFRAAgI21cy0tHAAEYAAAAASIOjLRpSQkuiVZ2UMuhiewcAt5fwgoycjEqBDX35U1KHwwAAAAABDQAAt5fwgoycjEqBDX35U1KHwwAC%2FfbzvQAAEA%3D%3D&exvsurl=1&path=/calendar/item"
        }
    ]
}"""
@app.route('/Outlook/WeekEvents')
def getWeekEvents():
    return OutlookWeekEvents()  

@app.route('/Outlook/MonthEvents')
def getMonthEvents():
    return OutlookMonthEvents()

@app.route('/Outlook/AllEvents')
def getAllEvents():
    return OutlookAllEvents()

""" Input: 
{
    "subject": "Listo",
    "dateStart": "2023-05-02T00:10:40.099Z",
    "dateEnd": "2023-05-03T00:10:50.099Z"
}"""
# Output: Event created successfully or Event failed to be created
@app.route('/Outlook/ScheduleMeeting', methods=['POST'])
def postScheduleMeeting():
    return OutlookScheduleMeeting()

# Input: N/A
""" Output: 
{
        "ID": 6,
        "Title": "Investigar recursos para aprender las tecnologías del reto (Sitio Web)",
        "WItype": "Task"
    },
    {
        "ID": 7,
        "Title": "Try Azure OpenAI Studio Playground.",
        "WItype": "Task"
    },"""
@app.route('/Azure/AllWI')
def getAllWI():
    return AzureWorkItems()

""" Input: 
{
    "id": 41
}"""
""" Output: 
{
    "ID": 41,
    "Title": "As an employee, I want to know the amount of pages of my Azure DevOps Wiki to know the state of the project.",
    "WItype": "User Story"
}"""
@app.route('/Azure/WI')
def getWI():
    return AzureOneItem()

""" Input: 
{
    "title": "Listo",
    "description": "Se logro",
    "type": "Task"
}"""
# Output: Work item created successfully or Failed to create work item. Error message: {response.text}
@app.route('/Azure/CreateItem', methods=['POST'])
def postCreateItem():
    return AzureCreateItem()

@app.route('/api/DatabaseGET')
def obtenerU():
    return obtener_usuarios()

@app.route('/api/DatabasePOST', methods=['POST'])
def mandarU():
    return guardar_usuario()

@app.route('/api/CheckHR', methods=['GET'])
def checkHR():
    return check_if_user_is_hr()




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)
