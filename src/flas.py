from flask import Flask, request, send_file,jsonify
import os
import json
from face_recognition import who_is_it ,img_to_encoding
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Define the upload folder paths
verification_images_folder = 'C:/Users/91930/OneDrive/Desktop/Mess/FinProject/verification_images'
input_image_folder = 'C:/Users/91930/OneDrive/Desktop/Mess/FinProject/input_image'

# Ensure upload folders exist
os.makedirs(verification_images_folder, exist_ok=True)
os.makedirs(input_image_folder, exist_ok=True)

# Set up allowed extensions and configure Flask app for file uploads
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}
app.config['UPLOAD_FOLDER_VERIFICATION'] = verification_images_folder
app.config['UPLOAD_FOLDER_INPUT'] = input_image_folder

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_verification_image():
    if 'photo' not in request.files:
        return 'No file part', 400

    file = request.files['photo']

    if file.filename == '':
        return 'No selected file', 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER_VERIFICATION'], filename)
        file.save(file_path)
        return file_path
        
    return 'Invalid file', 400

@app.route('/find', methods=['POST'])
def upload_input_image():
    if 'file' not in request.files:
        return 'No file part', 400

    file = request.files['file']
    childrenData = request.form.get('childrenData')
    print(childrenData)
    if file.filename == '':
        return 'No selected file', 400

    if file and allowed_file(file.filename):
        filename = 'input_image.jpg'
        file_path = os.path.join(app.config['UPLOAD_FOLDER_INPUT'], filename)
        file.save(file_path)
        print(childrenData)
        try:
            children_data_list=json.loads(childrenData)
        except json.JSONDecideError as e:
            return 'Error decoding ChildrenData :' +str(e),400
        child_info = {}

        # Here, you need to parse the childrenData and populate the child_info dictionary
        # Example:
        for child in children_data_list:
            # Access child name from the child dictionary
            child_name = child.get("name")  # Use get method to handle missing keys gracefully
            if child_name:
                photo_url = child.get("photoUrl")
                child_info[child_name] = img_to_encoding(photo_url)
            else:
                return 'Child name missing in one or more entries', 400
        min_dist,identity=who_is_it(file_path,child_info)
        return identity

    return 'Invalid file', 400

@app.route('/image/<path:filename>')
def get_image(filename):
    try:
        return send_file(filename, mimetype='image/jpg')
    except Exception as e:
        print('Error fetching image:', e)
        return 'Internal Server Error', 500

if __name__ == '__main__':
    app.run(debug=True, port=3001)
