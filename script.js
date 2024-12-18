document.addEventListener("DOMContentLoaded", () => {
    const main = document.querySelector("main");
    const addSubjectBtn = document.getElementById("add-subject-btn");
    const downloadPdfBtn = document.getElementById("download-pdf-btn");
    const greeting = document.getElementById("greeting");
    const subtext = document.getElementById("subtext");
    const totalAttendanceSection = document.getElementById("total-attendance");
    const overallPresentEl = document.getElementById("overall-present");
    const overallTotalEl = document.getElementById("overall-total");
    const overallPercentageEl = document.getElementById("overall-percentage");
  
    let attendanceData = {
      name: "",
      subjects: [],
    };
  
    // Ask for name and set greeting
    function setGreeting() {
      const name = prompt("Enter your name:");
      attendanceData.name = name ? name : "Guest";
      greeting.textContent = `Hello, ${attendanceData.name}!`;
      subtext.textContent = "Track your attendance below.";
    }
  
    // Calculate total attendance for all subjects
    function calculateTotalAttendance() {
      let totalPresent = 0;
      let totalClasses = 0;
  
      attendanceData.subjects.forEach((subject) => {
        totalPresent += subject.present;
        totalClasses += subject.present + subject.absent;
      });
  
      const totalPercentage = totalClasses === 0 ? 0 : ((totalPresent / totalClasses) * 100).toFixed(2);
  
      overallPresentEl.textContent = totalPresent;
      overallTotalEl.textContent = totalClasses;
      overallPercentageEl.textContent = `${totalPercentage}%`;
  
      if (attendanceData.subjects.length > 0) {
        totalAttendanceSection.classList.remove("hidden");
      } else {
        totalAttendanceSection.classList.add("hidden");
      }
    }
  
    // Render all subjects
    function renderSubjects() {
      const subjectsContainer = document.querySelector("#subjects-container");
  
      if (!subjectsContainer) {
        const section = document.createElement("section");
        section.id = "subjects-container";
        section.classList.add("space-y-6");
        main.appendChild(section);
      }
  
      document.getElementById("subjects-container").innerHTML = attendanceData.subjects
        .map(
          (subject, index) => `
          <div class="bg-gray-800 rounded-lg p-4 shadow-md space-y-4">
            <h3 class="text-lg font-bold text-yellow-400">${subject.name}</h3>
            <div class="attendance-controls flex justify-between space-x-2">
              <button class="present flex-1 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg shadow-md transition duration-300" data-index="${index}">
                Present
              </button>
              <button class="absent flex-1 py-2 bg-red-500 hover:bg-red-400 text-black font-bold rounded-lg shadow-md transition duration-300" data-index="${index}">
                Absent
              </button>
              <button class="delete flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 font-bold rounded-lg shadow-md transition duration-300" data-index="${index}">
                Delete
              </button>
            </div>
            <div class="attendance-stats mt-3 text-sm text-gray-300">
              <p>Classes Missed: <span class="font-bold">${subject.absent}</span></p>
              <p>Classes Attended: <span class="font-bold">${subject.present}</span></p>
              <p>Attendance: <span class="font-bold">${calculatePercentage(subject.present, subject.absent)}%</span></p>
            </div>
          </div>
        `
        )
        .join("");
  
      calculateTotalAttendance();
    }
  
    // Calculate attendance percentage
    function calculatePercentage(present, absent) {
      const total = present + absent;
      return total === 0 ? 0 : ((present / total) * 100).toFixed(2);
    }
  
    // Add new subject
    function addSubject() {
      const subjectName = prompt("Enter Subject Name:");
      if (subjectName) {
        attendanceData.subjects.push({ name: subjectName, present: 0, absent: 0 });
        renderSubjects();
      }
    }
  
    // Update attendance
    function updateAttendance(index, isPresent) {
      const subject = attendanceData.subjects[index];
      if (isPresent) {
        subject.present += 1;
      } else {
        subject.absent += 1;
      }
      renderSubjects();
    }
  
    // Delete subject
    function deleteSubject(index) {
      attendanceData.subjects.splice(index, 1);
      renderSubjects();
    }
  
    // Download attendance as PDF
    function downloadAttendanceAsPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
  
      // Add logo
      const img = new Image();
      img.src = "logo.png"; // Update with your logo's path
      img.onload = function () {
        doc.addImage(img, "PNG", 10, 10, 30, 30); // Logo dimensions
  
        // Title
        doc.setFontSize(16);
        doc.text(`Attendance Report for ${attendanceData.name}`, 60, 25); // Centered text
  
        // Content
        let y = 50;
        attendanceData.subjects.forEach((subject, index) => {
          doc.setFontSize(12);
          doc.text(`${index + 1}. ${subject.name}`, 10, y);
          doc.text(`Classes Attended: ${subject.present}`, 20, y + 10);
          doc.text(`Classes Missed: ${subject.absent}`, 20, y + 20);
          doc.text(
            `Attendance Percentage: ${calculatePercentage(subject.present, subject.absent)}%`,
            20,
            y + 30
          );
          y += 40;
        });
  
        // Overall Attendance
        const totalClasses = attendanceData.subjects.reduce(
          (sum, subject) => sum + subject.present + subject.absent,
          0
        );
        const totalPresent = attendanceData.subjects.reduce(
          (sum, subject) => sum + subject.present,
          0
        );
        const totalPercentage =
          totalClasses === 0 ? 0 : ((totalPresent / totalClasses) * 100).toFixed(2);
  
        doc.text(
          `Overall Attendance: ${totalPresent} / ${totalClasses} (${totalPercentage}%)`,
          10,
          y
        );
  
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150); // Gray color for footer
        doc.text(
          `© 2024 EzYaT - By Richard & Joshi`,
          10,
          doc.internal.pageSize.height - 10 // Bottom of the page
        );
  
        doc.save(`${attendanceData.name}-Attendance.pdf`);
      };
    }
  
    // Handle button clicks
    main.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
  
      if (e.target.classList.contains("present")) {
        updateAttendance(index, true);
      } else if (e.target.classList.contains("absent")) {
        updateAttendance(index, false);
      } else if (e.target.classList.contains("delete")) {
        deleteSubject(index);
      }
    });
  
    // Add subject button click event
    addSubjectBtn.addEventListener("click", addSubject);
  
    // Download PDF button click event
    downloadPdfBtn.addEventListener("click", downloadAttendanceAsPDF);
  
    setGreeting();
  });
  