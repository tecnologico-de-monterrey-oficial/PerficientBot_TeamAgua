from flask import Flask, jsonify, request
from dotenv import load_dotenv
import requests, os
load_dotenv("tokens.env")

# Header content types
CONTENT_TYPE = 'application/json'
# Header access tokens
API_GIT_KEY = os.environ.get("API_GIT_KEY")
# Links para hacer los API calls
API_GIT_REPOS = 'https://api.github.com/user/repos'

# Método GET
# Trae todos los repositorios de Github ligados al access token
def GithubRepos():
    # Defino Header específico para hacer el call
    headers = {'Authorization': f'Bearer {API_GIT_KEY}', 'Content-Type': CONTENT_TYPE}
    response = requests.get(API_GIT_REPOS, headers=headers)
    repos = []
    if response.status_code == 200:
        json_response = response.json()

        for item in json_response:
            repo = {
                "name": item.get('name'),
                "url": item.get('url')
            }
            repos.append(repo)
        return repos
    else:
        return 'Error: unable to retrieve data from external API'

# Método GET
# Trae todos los Issues de Github
def GithubIssues():
    issue = []
    names = []

    headers = {'Authorization': f'Bearer {API_GIT_KEY}', 'Content-Type': CONTENT_TYPE}
    response = requests.get(API_GIT_REPOS, headers=headers)

    json_response = response.json()

    # Itero entre todos los json de repositorios dentro del json devuelto para extraer cada nombre
    for item in json_response:
        fullName = item.get('full_name')
        if item.get('open_issues')!= 0:
            names.append(fullName)
    
    # Itero por el arreglo global de nombres y hago las llamadas a la función de issuesORpulls y determino que el json sea de un Issue
    for name in names:
        for item in issuesORpulls(name):
            if(item.get('draft') != False and item.get('draft') != True):
                values = {
                    "title": item.get('title'),
                    "body": item.get('body'),
                    "url": item.get('url')
                }
                issue.append(values)
    return issue

# Método GET
# Trae todos los Pull Request de Github
def GithubPulls():
    pulls = []
    names = []

    headers = {'Authorization': f'Bearer {API_GIT_KEY}', 'Content-Type': CONTENT_TYPE}
    response = requests.get(API_GIT_REPOS, headers=headers)

    json_response = response.json()

    # Itero entre todos los json de repositorios dentro del json devuelto para extraer cada nombre
    for item in json_response:
        fullName = item.get('full_name')
        if item.get('open_issues')!= 0:
            names.append(fullName)

    # Itero por el arreglo global de nombres y hago las llamadas a la función de issuesORpulls y determino que el json sea de un Pull
    for name in names:
        for item in issuesORpulls(name):
            if(item.get('draft') == False or item.get('draft') == True):
                values = {
                    "title": item.get('title'),
                    "body": item.get('body'),
                    "url": item.get('url')
                }
                pulls.append(values)
    return pulls

# Función que hace la llamada a la API de Github y dependiendo del contenido va a ser un Issue o Pull Request
def issuesORpulls(fullNameValue):
    # Defino Header específico para hacer el call
    headers = {'Authorization': f'Bearer {API_GIT_KEY}', 'Content-Type': CONTENT_TYPE}
    response = requests.get(f'https://api.github.com/repos/{fullNameValue}/issues', headers=headers)

    # Verifica si el call devuelve un error y si no devuelve el json
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        return 'Error: unable to retrieve data from external API'

