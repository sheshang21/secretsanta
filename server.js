const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files (index.html, CSS, JavaScript)
app.use(express.static(path.join(__dirname, 'public')));

// Setup multer for file upload
const upload = multer({ dest: 'uploads/' }); // Files will be stored in 'uploads/' directory

// Endpoint to handle file upload and conversion to JSON
app.post('/upload-file', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const filePath = path.join(__dirname, req.file.path);
  convertExcelToJson(filePath, (jsonData) => {
    if (jsonData) {
      const outputPath = path.join(__dirname, 'employees.json');
      fs.writeFileSync(outputPath, JSON.stringify({ Sheet1: jsonData }, null, 2));
      res.json({ success: true, message: 'File uploaded and converted successfully.' });
    } else {
      res.status(500).json({ success: false, message: 'Error converting file.' });
    }

    // Delete the uploaded file after conversion
    fs.unlinkSync(filePath);
  });
});

// Convert Excel to JSON
function convertExcelToJson(excelFilePath, callback) {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.xlsx.readFile(excelFilePath).then(() => {
      const worksheet = workbook.getWorksheet(1); // Assuming first sheet
      const jsonData = [];
      
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          const id = row.getCell(1).value;
          const name = row.getCell(2).value;
          if (id && name) {
            jsonData.push({ IDs: id, 'Employee Name': name });
          }
        }
      });

      callback(jsonData);
    }).catch((error) => {
      console.error('Error reading Excel file:', error.message);
      callback(null);
    });
  } catch (error) {
    console.error('Error processing Excel file:', error.message);
    callback(null);
  }
}

// Serve index.html on root request
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Ensure index.html is in the root of the project
});

// Endpoint to pick a chit
app.get('/pick-chit', (req, res) => {
  const employeeId = req.query.id; // Get employee ID from query parameter

  if (!employeeId) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }

  const employees = JSON.parse(fs.readFileSync(path.join(__dirname, 'employees.json'))).Sheet1;

  // Exclude the employee with the given ID
  const filteredEmployees = employees.filter(emp => emp.IDs != employeeId);

  if (filteredEmployees.length === 0) {
    return res.status(500).json({ error: 'No employees found for chit picking after exclusion' });
  }

  // Pick a random chit
  const randomChit = filteredEmployees[Math.floor(Math.random() * filteredEmployees.length)];
  res.json({ pickedChit: randomChit['Employee Name'] });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
