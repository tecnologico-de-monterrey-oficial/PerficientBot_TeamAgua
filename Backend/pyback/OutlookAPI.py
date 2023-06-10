from flask import Flask, jsonify, request
from datetime import datetime, timedelta
from dotenv import load_dotenv
import requests, os

load_dotenv("tokens.env")

app = Flask(__name__)

# Header content types
CONTENT_TYPE = 'application/json'
# Header access tokens
API_OUT_KEY = os.environ.get("API_OUT_KEY")

# Links para hacer los API calls
API_OUT_POSTMEETING = 'https://graph.microsoft.com/v1.0/me/events'
API_OUT_FINDMEETING = 'https://graph.microsoft.com/v1.0/me/findMeetingTimes'
API_OUT_ALLEVENTS = 'https://graph.microsoft.com/v1.0/me/events?$select=subject,body,bodyPreview,organizer,attendees,start,end,location'
API_OUT_GROUPS = 'https://graph.microsoft.com/v1.0/me/memberOf'
API_OUT_FINDTIME = 'https://graph.microsoft.com/v1.0/me/findMeetingTimes'

'''
{
    "attendees":[{"emailAddress": {"address": "A00831316@tec.mx"}},{"emailAddress": {"address": "A01411625@tec.mx"}}],
    "startDateTime": "2023-05-24T09:00:00",
    "finishDateTime": "2023-05-26T09:00:00",
    "duration": "PT1H"
}
'''
def OutlookFindMeetingTime():
    # Defino Header específico para hacer el call
    headers = {'Authorization': f'Bearer {API_OUT_KEY}', 'Content-Type': CONTENT_TYPE}

    addresses = request.json.get('attendees')
    start = request.json.get('startDateTime')
    finish = request.json.get('finishDateTime')
    duration = request.json.get('duration')

    data = {
        "attendees": addresses,
        "timeConstraint": {
            "timeslots": [
                {"start": {"dateTime": start, "timeZone": "UTC"},
                 "end": {"dateTime": finish, "timeZone": "UTC"}}
            ]
        },
        "meetingDuration": duration,
        "returnSuggestionReasons": "True"
    }

    # Hace el POST y verifica si se hace la llamada correctamente
    response = requests.post(API_OUT_FINDTIME, headers=headers, json=data)
    if response.status_code == 201:
        json_response = response.json()
        return json_response
    else:
        json_response = response.json()
        return json_response


# Método GET
# Trae todos los events que se tengan agendados en Outlook
def OutlookAllEvents():
    # Defino Header específico para hacer el call
    headers = {'Authorization': f'Bearer {API_OUT_KEY}', 'Content-Type': CONTENT_TYPE}
    response = requests.get(API_OUT_ALLEVENTS, headers=headers)

    # Verifica si el call devuelve un error
    if response.status_code == 200:
        json_response = response.json()
        subjects = []
        # Itero sobre el json de respuesta para extraer el subject de cada meeting
        for item in json_response['value']:
            subject = item['subject']
            start = item['start']
            end = item['end']
            web = item['webLink']
            id = item['id']

            attendees = []
            for i in item['attendees']:
                attendees.append(i['emailAddress']['name'])

            subjects.append({
                "subject": subject,
                "attendees": attendees,
                "start": start,
                "end": end,
                "web": web,
                "id": id
            })
        
        return subjects
    else:
        return 'Error: unable to retrieve data from external API ' + response.text

# Método GET
# Trae todos los events que se tengan agendados en Outlook de hoy a una semana
def OutlookWeekEvents():
    # Defino variables de tiempo actual y una semana depués 
    current_date = datetime.now()
    next_week = current_date + timedelta(weeks=1)

    # Defino Header específico para hacer el call
    headers = {'Authorization': f'Bearer {API_OUT_KEY}', 'Content-Type': CONTENT_TYPE}
    response = requests.get(f'https://graph.microsoft.com/v1.0/me/calendarview?startdatetime={current_date}Z&enddatetime={next_week}', headers=headers)

    # Verifica si el call devuelve un error
    if response.status_code == 200:
        json_response = response.json()
        subjects = []
        # Itero sobre el json de respuesta para extraer el subject de cada meeting
        for item in json_response['value']:
            subject = item['subject']
            start = item['start']
            end = item['end']
            web = item['webLink']
            id = item['id']

            attendees = []
            for i in item['attendees']:
                attendees.append(i['emailAddress']['name'])

            subjects.append({
                "subject": subject,
                "attendees": attendees,
                "start": start,
                "end": end,
                "web": web,
                "id": id
            })
        
        return subjects
    else:
        return 'Error: unable to retrieve data from external API ' + response.text
    
# Método GET
# Trae todos los events que se tengan agendados en Outlook de hoy a un mes
def OutlookMonthEvents():
    # Defino variables de tiempo actual y una semana depués 
    current_date = datetime.now()
    next_month = current_date + timedelta(days=30)

    # Defino Header específico para hacer el call
    headers = {'Authorization': f'Bearer {API_OUT_KEY}', 'Content-Type': CONTENT_TYPE}
    response = requests.get(f'https://graph.microsoft.com/v1.0/me/calendarview?startdatetime={current_date}Z&enddatetime={next_month}', headers=headers)

    # Verifica si el call devuelve un error
    if response.status_code == 200:
        json_response = response.json()
        subjects = []
        # Itero sobre el json de respuesta para extraer el subject de cada meeting
        for item in json_response['value']:
            subject = item['subject']
            start = item['start']
            end = item['end']
            web = item['webLink']
            id = item['id']

            attendees = []
            for i in item['attendees']:
                attendees.append(i['emailAddress']['name'])

            subjects.append({
                "subject": subject,
                "attendees": attendees,
                "start": start,
                "end": end,
                "web": web,
                "id": id
            })
        
        return subjects
    else:
        return 'Error: unable to retrieve data from external API ' + response.text
    
# Método Post
# Crea un Meeting con el subject y duración determinado
# JSON entrada:
#{
#    "subject": "Listo",
#    "dateStart": "2023-05-02T00:10:40.099Z",
#    "dateEnd": "2023-05-03T00:10:50.099Z"
#}
def OutlookScheduleMeeting():
    # Defino Header específico para hacer el call
    headers = {'Authorization': f'Bearer {API_OUT_KEY}', 'Content-Type': CONTENT_TYPE}

    # Extraigo la información del JSON de entrada
    subject = request.json.get('subject')
    dateStart = request.json.get('startDate')
    dateEnd = request.json.get('endDate')

    # Construyo el cuerpo del JSON para mandar en el POST
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

    # Hace el POST y verifica si se crea correctamente
    response = requests.post(API_OUT_POSTMEETING, headers=headers, json=data)
    if response.status_code == 201:
        data = response.json()
        return {'message': 'Event created successfully.',
                'url': data['webLink']}
    else:
        response_data = {'message': 'Event failed to be created.'}
        return response_data

def OutlookGroups():
    # Defino Header específico para hacer el call
    headers = {'Authorization': f'Bearer {API_OUT_KEY}', 'Content-Type': CONTENT_TYPE}
    response = requests.get(API_OUT_GROUPS, headers=headers)

    name = []
    json_response = response.json()

    if response.status_code == 200:
        for item in json_response['value']:
           name.append(item['displayName'])
        return name
    else:
        return 'Error: unable to retrieve data from external API ' + response.text
    
# Metodo Delete para borrar meeting
# Requiere JSON en formato:
#{
# "id":"sdfsfddsf"
# }
def OutlookDelete():
    # Defino Header específico para hacer el call
    headers = {'Authorization': f'Bearer {API_OUT_KEY}', 'Content-Type': CONTENT_TYPE}
    event_id = request.json.get('id')
    response = requests.delete(f'https://graph.microsoft.com/v1.0/me/events/{event_id}', headers=headers)

    if response.status_code == 204:
        return jsonify({'message': 'Event deleted successfully'})
    else:
        return jsonify({'message': 'Failed to delete event'})


    
