import csv
import os

class User:
    def __init__(self, username, role):
        self.username = username
        self.role = role

class AuthManager:
    def __init__(self):
        self.users_file = "data/users.csv"
        self.users = {}
        self.load_users()

    def load_users(self):
        if not os.path.exists(self.users_file):
            return

        try:
            with open(self.users_file, mode='r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    self.users[row['username']] = {
                        "password": row['password'],
                        "role": row['role']
                    }
        except Exception as e:
            print(f"Error loading users: {e}")

    def login(self, username, password):
        self.load_users() # Reload to get fresh data
        user_data = self.users.get(username)
        if user_data and user_data["password"] == password:
            return User(username, user_data["role"])
        return None

    def create_user(self, username, password, role="employee"):
        self.load_users()
        if username in self.users:
            return False, "El usuario ya existe."
        
        try:
            with open(self.users_file, mode='a', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                writer.writerow([username, password, role])
                
            self.users[username] = {"password": password, "role": role}
            return True, "Usuario creado exitosamente."
        except Exception as e:
            return False, str(e)

    def get_all_users(self):
        self.load_users()
        return [{"username": u, "role": d["role"]} for u, d in self.users.items()]
