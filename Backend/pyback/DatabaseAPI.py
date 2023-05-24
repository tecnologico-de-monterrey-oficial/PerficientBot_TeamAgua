from flask import Flask, request, jsonify
import pyodbc

app = Flask(__name__)

def obtener_usuarios():
    server = 'agua-perficientbot-server.database.windows.net'
    database = 'Agua_PerficientBot-db'
    username = 'Agua'
    password = '3l4guaM0ja'
    driver = '{ODBC Driver 17 for SQL Server}'
    conexion_str = f"DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}"

    try:
        conexion = pyodbc.connect(conexion_str)
        cursor = conexion.cursor()

        cursor.execute('SELECT user_id, name, surname, fullname, email, sub FROM users')

        resultados = cursor.fetchall()

        conexion.close()

        usuarios = []
        for fila in resultados:
            usuario = {
                'id': fila.user_id,
                'nombre': fila.name,
                'apellido': fila.surname,
                'nombrecompleto': fila.fullname,
                'mail': fila.email,
                'sub': fila.sub
            }
            usuarios.append(usuario)

        return jsonify(usuarios)

    except Exception as e:
        return f"Error: {str(e)}"


def guardar_usuario(): #method=['POST']
    server = 'agua-perficientbot-server.database.windows.net'
    database = 'Agua_PerficientBot-db'
    username = 'Agua'
    password = '3l4guaM0ja'
    driver = '{ODBC Driver 17 for SQL Server}'
    conexion_str = f"DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}"

    try:
        datos_usuario = request.get_json()

        nombre = datos_usuario['nombre']
        apellido = datos_usuario['apellido']
        correo = datos_usuario['correo']
        fullname = datos_usuario['fullname']
        sub = datos_usuario['sub']

        conexion = pyodbc.connect(conexion_str)
        cursor = conexion.cursor()

        cursor.execute("SELECT COUNT(*) FROM users WHERE email = ?", correo)
        resultado = cursor.fetchone()

        if resultado[0] > 0:
            return jsonify({'mensaje': 'El usuario ya existe'})

        cursor.execute("INSERT INTO users (name, surname, fullname, email, sub) VALUES (?, ?, ?, ?, ?)", nombre, apellido, correo, sub)
        conexion.commit()

        cursor.execute("SELECT user_id FROM users WHERE email = ?", correo)
        resultado = cursor.fetchone()
        user_id = resultado[0]

        conexion.close()

        return jsonify({'mensaje': 'Usuario guardado exitosamente', 'user_id': user_id})

    except Exception as e:
        return f"Error: {str(e)}"
def getfullname():
    server = 'agua-perficientbot-server.database.windows.net'
    database = 'Agua_PerficientBot-db'
    username = 'Agua'
    password = '3l4guaM0ja'
    driver = '{ODBC Driver 17 for SQL Server}'
    conexion_str = f"DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}"

    #try:
        #conexion = pyodbc.connect(conexion_str)
        #cursor = conexion.cursor()

        #cursor.execute('SELECT user_id, name, surname, fullname, email, sub FROM users') # From Users Where fullname like var¿?




