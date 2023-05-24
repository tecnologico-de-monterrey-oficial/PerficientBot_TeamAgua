import unittest
from flask import Flask
from flask.testing import FlaskClient
from AguaAPI import app

# Uso librería de unittest para crear pruebas de cada ruta
class AppTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()

    def test_Happy_PathUploadCV(self):
        response = self.app.post('/upload/windowslive|f6a8eb57361df774')
        self.assertEqual(response.status_code, 200)

    def test_Happy_PathGetSummary(self):
        response = self.app.get('/CV/windowslive|f6a8eb57361df774')
        self.assertEqual(response.status_code, 200)

    def test_Happy_PathGetCV(self):
        response = self.app.get('/GPTtext/windowslive|f6a8eb57361df774')
        self.assertEqual(response.status_code, 200)

    def test_Happy_PathGetGithubRepos(self):
        response = self.app.get('/Github/Repositories')
        self.assertEqual(response.status_code, 200)
        
    def test_Happy_PathGetGithubIssues(self):
        response = self.app.get('/Github/Issues')
        self.assertEqual(response.status_code, 200)
        
    def test_Happy_PathGetGithubPulls(self):
        response = self.app.get('/Github/Pulls')
        self.assertEqual(response.status_code, 200)

    def test_Happy_PathGetOutlookGroups(self):
        response = self.app.get('/Outlook/Groups')
        self.assertEqual(response.status_code, 200)

    def test_postOutlookFindTime(self):
        with app.test_client() as client:
            input_data = {
            "emailAddress": {"address": "A00831316@tec.mx"},
            "startDateTime": "2023-05-24T09:00:00",
            "finishDateTime": "2023-05-26T09:00:00",
            "duration": "PT1H"
            }
        response = client.post('/Outlook/FindTime', json=input_data)
        assert response.status_code == 200

    def test_postCreateItem(self):
        with app.test_client() as client:
            input_data = {
            "title": "Listo",
            "description": "Se logro",
            "type": "Task"
            }
        response = client.post('/Azure/CreateItem', json=input_data)
        assert response.status_code == 200

if __name__ == '__main__':
    unittest.main()