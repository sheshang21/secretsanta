document.getElementById('uploadBtn').addEventListener('click', function () {
    const fileInput = document.getElementById('fileUpload');
    const file = fileInput.files[0];
  
    if (!file) {
      alert("Please upload a file first.");
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    // Upload the file and convert it to JSON
    fetch('/upload-file', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert("File uploaded and converted successfully.");
        } else {
          alert(data.message);
        }
      })
      .catch(error => {
        alert("Error: " + error.message);
      });
  });
  
  document.getElementById('openChitButton').addEventListener('click', function () {
    const employeeId = document.getElementById('employeeId').value;
    
    if (!employeeId) {
      alert("Please enter an Employee ID.");
      return;
    }
  
    const chitBox = document.getElementById('chitBox');
    const chitText = document.getElementById('chitText');
  
    chitBox.classList.add('open');
    chitText.innerText = "Opening Chit...";
  
    setTimeout(function () {
      fetch(`/pick-chit?id=${employeeId}`) // Pass the employee ID as query parameter
        .then(response => response.json())
        .then(data => {
          if (data.pickedChit) {
            chitText.innerText = `You picked: ${data.pickedChit}`;
          } else {
            chitText.innerText = "No chit picked!";
          }
        })
        .catch(error => {
          chitText.innerText = `Error: ${error.message}`;
        });
    }, 2000); // 2 seconds delay for animation
  });
  