const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'C:/Users/91930/OneDrive/Desktop/Mess/FinProject/verification_images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});


const upload = multer({ storage: storage });

app.post('/upload', upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  console.log(req.file.originalname)
  const filePath = path.join(
    'C:/Users/91930/OneDrive/Desktop/Mess/FinProject/verification_images',
    req.file.originalname
  );
  res.send(filePath);
});

const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'C:/Users/91930/OneDrive/Desktop/Mess/FinProject/input_image');
  },
  filename: (req, file, cb) => {
    cb(null, 'input_image.jpg');
  },
});

const upload2 = multer({ storage: storage2 });

app.post('/find', upload2.single('file'), async (req, res) => {
  console.log(req.body)
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = path.join(
    'C:/Users/91930/OneDrive/Desktop/Mess/FinProject/input_image',
    'input_image.jpg'
  );
  res.send(filePath);
});

app.get('/image/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(
      '',
      fileName
    );

    const fileContent = await fs.readFile(filePath);

    res.type('jpg');
    res.send(fileContent);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
