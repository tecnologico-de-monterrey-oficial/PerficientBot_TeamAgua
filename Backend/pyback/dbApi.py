from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
import pyodbc

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route('/api/DatabaseGET')
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

        
        fullname = request.args.get('fullname', '')

        if fullname:
            cursor.execute('SELECT user_id, name, surname, fullname, email, sub FROM users WHERE fullname LIKE ?', f'%{fullname}%')
        else:
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
        return jsonify({'error': str(e)}), 500



@app.route('/api/DatabasePOST', methods=['POST'])
def guardar_usuario():
    server = 'agua-perficientbot-server.database.windows.net'
    database = 'Agua_PerficientBot-db'
    username = 'Agua'
    password = '3l4guaM0ja'
    driver = '{ODBC Driver 17 for SQL Server}'
    conexion_str = f"DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}"

    try:

        datos_usuario = request.get_json()
        print(datos_usuario)  # Debugging line

        nombre = datos_usuario['nombre']
        apellido = datos_usuario['apellido']
        nombre_completo = datos_usuario['nombre_completo']
        correo = datos_usuario['correo']
        sub = datos_usuario['sub']


        conexion = pyodbc.connect(conexion_str)
        cursor = conexion.cursor()


        cursor.execute("SELECT COUNT(*) FROM users WHERE email = ?", correo)
        resultado = cursor.fetchone()

        if resultado[0] > 0:
            return jsonify({'mensaje': 'El usuario ya existe'})


        cursor.execute("INSERT INTO users (name, surname,fullname, email, sub) VALUES (?, ?, ?, ?, ?)", nombre, apellido, nombre_completo, correo, sub)
        conexion.commit()


        cursor.execute("SELECT user_id FROM users WHERE email = ?", correo)
        resultado = cursor.fetchone()
        user_id = resultado[0]


        conexion.close()

        return jsonify({'mensaje': 'Usuario guardado exitosamente', 'user_id': user_id})


    except Exception as e:
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

@app.route('/api/CheckHR', methods=['GET'])
def check_if_user_is_hr():
    server = 'agua-perficientbot-server.database.windows.net'
    database = 'Agua_PerficientBot-db'
    username = 'Agua'
    password = '3l4guaM0ja'
    driver = '{ODBC Driver 17 for SQL Server}'
    conexion_str = f"DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}"

    try:
        conexion = pyodbc.connect(conexion_str)
        cursor = conexion.cursor()

        user_sub = request.args.get('sub', '')

        cursor.execute('SELECT dbo.fn_CheckIfUserIsHR(?) AS IsHR;', user_sub)

        resultados = cursor.fetchall()

        conexion.close()

        usuarios = []
        for fila in resultados:
            usuario = {
                'IsHR': bool(fila.IsHR)
            }
            usuarios.append(usuario)

        return jsonify(usuarios)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(port=8000)