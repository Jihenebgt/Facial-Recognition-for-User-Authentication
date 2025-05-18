# import json
# import os

# # Set the database directory
# db_dir = '../database'  # Relative to backend directory

# # Load users
# users_file = os.path.join(db_dir, 'users.json')
# if os.path.exists(users_file):
#     with open(users_file, 'r') as f:
#         users = json.load(f)
#     print("=== USERS ===")
#     for user_id, user_data in users.items():
#         print(f"User ID: {user_id}")
#         print(f"Name: {user_data.get('name')}")
#         print(f"Age: {user_data.get('age')}")
#         print(f"Profession: {user_data.get('profession')}")
#         print("---")
# else:
#     print("Users database not found or empty")

# # Load logs
# logs_file = os.path.join(db_dir, 'logs.json')
# if os.path.exists(logs_file):
#     with open(logs_file, 'r') as f:
#         logs = json.load(f)
#     print("\n=== LOGS ===")
#     for log in logs[-10:]:  # Show last 10 logs
#         print(f"Time: {log.get('timestamp')}")
#         print(f"Action: {log.get('action')}")
#         print(f"Result: {log.get('result', 'N/A')}")
#         print("---")
# else:
#     print("Logs database not found or empty")
