function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleString();
}

async function loadReports() {
  try {
    const res = await fetch('/api/requests/user-reports');
    if (!res.ok) throw new Error('Failed to load reports');
    const reports = await res.json();
    const tbody = document.querySelector('#reportsTable tbody');
    tbody.innerHTML = '';

    reports.forEach(report => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${report.id}</td>
        <td>${report.title}</td>
        <td>${report.description}</td>
        <td>${report.status}</td>
        <td>${report.priority}</td>
        <td>${report.technician || '-'}</td>
        <td>${formatDate(report.createdAt)}</td>
        <td>${formatDate(report.updatedAt)}</td>
        <td><!-- Attachment will be added later --></td>
        <td><button class="edit-btn">Edit</button></td>
        <td><button class="delete-btn">Delete</button></td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    alert('Failed to load reports. Make sure you are logged in.');
  }
}

document.addEventListener('DOMContentLoaded', loadReports);
