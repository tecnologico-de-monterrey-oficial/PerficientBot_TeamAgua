import unittest
from flask import Flask
from flask.testing import FlaskClient
from AguaAPI import app

# Uso librería de unittest para crear pruebas de cada ruta
class AppTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()

    def test_uploadCV(self):
        response = self.app.post('/upload/123')
        self.assertEqual(response.status_code, 200)

    def test_getGithubRepos(self):
        response = self.app.get('/Github/Repositories')
        self.assertEqual(response.status_code, 200)
        
    def test_getGithubIssues(self):
        response = self.app.get('/Github/Issues')
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()