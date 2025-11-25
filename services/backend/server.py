
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
from flask import Flask, jsonify, request, abort
from flask_cors import CORS
import os

load_dotenv()
print(os.getenv("MONGO_URI"))
client = MongoClient(os.getenv("MONGO_URI"))

db = client['rate-my-dish']
users = db.users
dishes = db.dishes
locations = db.locations

app = Flask(__name__)
CORS(app)

@app.post("/api/users")
def add_user():

    user_data = request.get_json()


    if not user_data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    if "email" not in user_data:
        return jsonify({"error": "email is required"}), 400
    
    res = users.insert_one(user_data)
    user_data["_id"] = str(res.inserted_id)
    
    return jsonify(user_data)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)