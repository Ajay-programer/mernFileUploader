# MERN File Upload Application

## Description
This MERN stack application allows users to upload video and audio files along with metadata to an AWS S3 server. The application includes file compression for video files and ensures the duration of the uploaded files does not exceed 30 minutes.

## Features
- Upload video and audio files with metadata (title, description).
- Limit the duration of the uploaded files to a maximum of 30 minutes.
- Compress video files after uploading.
- Display a progress bar during the upload process.
- Show a list of uploaded files with their metadata.

## Technologies Used
- **Frontend**: React, Axios
- **Backend**: Node.js, Express.js, Multer, AWS SDK, FFmpeg
- **Database**: MongoDB
- **Storage**: AWS S3
Also used Multer

## Prerequisites
- Node.js and npm installed
- MongoDB instance (local or cloud)
- AWS S3 bucket
- FFmpeg installed

ENV file structure 

MONGODB_URI=<your_mongodb_uri>
AWS_ACCESS_KEY_ID=<your_aws_access_key_id>
AWS_SECRET_ACCESS_KEY=<your_aws_secret_access_key>
AWS_REGION=<your_aws_region>
S3_BUCKET_NAME=<your_s3_bucket_name>


Folder structure 
.
├── backend
│   ├── index.js
│   └── package.json
├── frontend
│   ├── public
│   ├── src
│   │   ├── App.js
│   │   ├── uploadForm.js
│   │   ├── UploadForm.css
│   └── package.json
└── README.md

