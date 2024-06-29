const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const AWS = require('aws-sdk');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); // Enable CORS

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// Define Mongoose schema and model
const fileSchema = new mongoose.Schema({
    title: String,
    description: String,
    filename: String,
    metadata: Object,
    duration: Number,
    fileType: String,
});

const File = mongoose.model('File', fileSchema);

// AWS S3 configuration
const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KYE_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
});

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

app.use(express.json());

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const { title, description } = req.body;
    const filePath = req.file.path;

    // Check file duration
    ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
            console.error('Error probing file:', err);
            return res.status(500).send('Error probing file.');
        }

        const duration = metadata.format.duration;
        if (duration > 1800) {
            fs.unlinkSync(filePath); // Remove file
            return res.status(400).send('File duration exceeds 30 minutes');
        }

        const fileType = req.file.mimetype.split('/')[0];

        // Compress video if it is a video file
        if (fileType === 'video') {
            const compressedFilePath = `uploads/compressed-${req.file.filename}`;

            ffmpeg(filePath)
                .output(compressedFilePath)
                .videoCodec('libx264')
                .on('end', () => {
                    uploadToS3(compressedFilePath);
                })
                .run();
        } else {
            uploadToS3(filePath);
        }

        const uploadToS3 = (file) => {
            const fileStream = fs.createReadStream(file);

            const uploadParams = {
                Bucket: process.env.S3_BUCKET,
                Key: path.basename(file),
                Body: fileStream,
            };

            s3.upload(uploadParams, (s3Err, data) => {
                if (s3Err) {
                    console.error('Error uploading to S3:', s3Err);
                    return res.status(500).send('Error uploading to S3.');
                }

                const newFile = new File({
                    title,
                    description,
                    filename: data.Key,
                    metadata,
                    duration,
                    fileType,
                });

                newFile.save((saveErr, savedFile) => {
                    if (saveErr) {
                        console.error('Error saving file metadata:', saveErr);
                        return res.status(500).send('Error saving file metadata.');
                    }
                    res.status(200).send(savedFile);
                });
            });
        };
    });
});


app.listen(port, () => console.log(`Server running on port ${port}`));
