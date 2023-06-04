from flask import Flask, jsonify, request
from dotenv import load_dotenv
import requests, base64, json, os

app = Flask(__name__)
load_dotenv("tokens.env")
ORGANIZATION = 'EquipoAgua'
PROJECT = 'Agua'

# Header content types
CONTENT_TYPE = 'application/json'
CONTENT_TYPE2 = 'application/json-patch+json'

# Header access tokens
API_DEV_KEY = os.environ.get("API_DEV_KEY")

# Función para traer todos los IDs de los work items
def idWI():
    username = 'Username'

    # Encode the username and password as base64
    auth_str = f'{username}:{API_DEV_KEY}'
    auth_bytes = auth_str.encode('ascii')
    auth_b64_bytes = base64.b64encode(auth_bytes)
    auth_token = auth_b64_bytes.decode('ascii')
    
    headers = {'Authorization': f'Basic {auth_token}', 'Content-Type': CONTENT_TYPE}
    API_DEV_IDWI = f"https://dev.azure.com/{ORGANIZATION}/{PROJECT}/_apis/wit/wiql?api-version=7.0"

    data = {
            "query" : "SELECT [System.Id] FROM WorkItems"
        }
    response = requests.post(API_DEV_IDWI, headers=headers, json=data)

    # Check the response status code
    if response.status_code == 200:
        json_response = response.json()
        ids = []
        for item in json_response['workItems']:
            ids.append(item['id'])
        return ids
    else:
        return jsonify({"message": f"Failed to create work item. Error message: {response.text}"}), 400

# Método GET
# Trae todos los work items de un projecto de la organización
def AzureWorkItems():

    WI = []

    username = 'Username'

    # Encode the username and password as base64
    auth_str = f'{username}:{API_DEV_KEY}'
    auth_bytes = auth_str.encode('ascii')
    auth_b64_bytes = base64.b64encode(auth_bytes)
    auth_token = auth_b64_bytes.decode('ascii')
    
    headers = {'Authorization': f'Basic {auth_token}', 'Content-Type': CONTENT_TYPE2}

    for id in idWI():
        API_DEV_ITEMS = f"https://dev.azure.com/{ORGANIZATION}/{PROJECT}/_apis/wit/workitems/{id}?api-version=7.0"
        response = requests.get(API_DEV_ITEMS, headers=headers)
        try:
            data = response.json()

            wi = {
                "ID" : data['id'],
                "Title": data['fields']['System.Title'],
                "WItype": data['fields']['System.WorkItemType'],
                "url": data['url']
            }

            WI.append(wi)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON response: {e}")
            continue
    return WI


# Método GET
# Trae todos los work items de un projecto de la organización
def AzureOneItem(id):
    username = 'Username'

    # Encode the username and password as base64
    auth_str = f'{username}:{API_DEV_KEY}'
    auth_bytes = auth_str.encode('ascii')
    auth_b64_bytes = base64.b64encode(auth_bytes)
    auth_token = auth_b64_bytes.decode('ascii')
    
    headers = {'Authorization': f'Basic {auth_token}', 'Content-Type': CONTENT_TYPE2}
    API_DEV_ITEMS = f"https://dev.azure.com/{ORGANIZATION}/{PROJECT}/_apis/wit/workitems/{id}?api-version=7.0"
    response = requests.get(API_DEV_ITEMS, headers=headers)
    try:
        data = response.json()

        wi = {
            "ID" : data['id'],
            "Title": data['fields']['System.Title'],
            "WItype": data['fields']['System.WorkItemType'],
            "url": data['url']
        }
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON response: {e}")
    return wi


# Método Post
# Crea un work item en el proyecto de devops y necesito json de entrada con el siguiente formato:
#{
#    "title": "Listo",
#    "description": "Se logro",
#    "type": "Task"
#}
def AzureCreateItem():
    
    username = 'Username'

    # Encode the username and password as base64
    auth_str = f'{username}:{API_DEV_KEY}'
    auth_bytes = auth_str.encode('ascii')
    auth_b64_bytes = base64.b64encode(auth_bytes)
    auth_token = auth_b64_bytes.decode('ascii')
    
    headers = {'Authorization': f'Basic {auth_token}', 'Content-Type': CONTENT_TYPE2}

    title = request.json.get('title')
    description = request.json.get('description')
    wiType = request.json.get('type')

    API_DEV_ITEM = f"https://dev.azure.com/{ORGANIZATION}/{PROJECT}/_apis/wit/workitems/${wiType}?api-version=7.0"

    work_item_data = [
        {
            "op": "add",
            "path": "/fields/System.Title",
            "value": title
        },
        {
            "op": "add",
            "path": "/fields/System.Description",
            "value": description
        }
    ]

    response = requests.post(API_DEV_ITEM, headers=headers, json=work_item_data)

    # Check the response status code
    if response.status_code == 200:
        data = response.json()
        url = data['url']
        id_wi = data['id']
        return jsonify({"message": "Work item created successfully.",
                        "url": f"{url}",
                        "ID": f"{id_wi}"})
    #Added id to response too
    else:
        return jsonify({"message": f"Failed to create work item. Error message: {response.text}"}), 400