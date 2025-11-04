// Menu 
const toggleBtn = document.getElementById("menu-toggle");
const menuPopup = document.getElementById("menu-popup");

toggleBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  menuPopup.classList.toggle("show");
});

window.addEventListener("click", (e) => {
  if (!e.target.closest("#menu-popup") && !e.target.closest("#menu-toggle")) {
    menuPopup.classList.remove("show");
  }
});

// Fetch Track Reports from Backend
const repairList = document.getElementById("repairList");

async function fetchRepairs() {
  try {
    const response = await fetch("/api/requests/user-trackreports", { credentials: "include" });
    if (!response.ok) throw new Error("Failed to fetch reports");

    const repairs = await response.json();
    renderRepairs(repairs);
  } catch (err) {
    console.error(err);
    repairList.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888;">ไม่สามารถโหลดข้อมูลได้</td></tr>`;
  }
}

// Render Reports
function renderRepairs(repairs) {
  repairList.innerHTML = "";

  if (!repairs || repairs.length === 0) {
    repairList.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888;">ไม่มีข้อมูลการแจ้งซ่อม</td></tr>`;
    return;
  }

  repairs.forEach((r) => {
    const tr = document.createElement("tr");
    tr.classList.add("clickable-row");
    tr.setAttribute("data-id", r.id);
    tr.setAttribute("data-status", r.status);

    // Only show edit (view) and delete if pending
    const showEdit = r.status === "รอดำเนินการ";
    const showDelete = r.status === "รอดำเนินการ";

    tr.innerHTML = `
      <td>${new Date(r.createdAt).toLocaleDateString()}</td>
      <td>${r.reporterName}</td>
      <td>${r.technician || "-"}</td>
      <td>${r.title}</td>
      <td>${r.status}</td>
      <td>
        ${showEdit ? `<button class="icon-btn view"><span class="material-icons">search</span></button>` : ""}
        ${showDelete ? `<button class="icon-btn delete"><span class="material-icons">delete</span></button>` : ""}
      </td>
    `;
    repairList.appendChild(tr);
  });

  attachRowEvents();
}

// Attach row events
function attachRowEvents() {
  const modalConfirm = document.getElementById("confirmModal");
  const closeModal = document.getElementById("closeModal");
  const cancelModal = document.getElementById("cancelModal");
  const confirmDelete = document.getElementById("confirmDelete");
  let selectedId = null;

  // Row click - optional redirect
  document.querySelectorAll(".clickable-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      const id = row.getAttribute("data-id");
      window.location.href = `track_detail.html?id=${id}`;
    });
  });

  // View button - open modal only if pending
  document.querySelectorAll(".icon-btn.view").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const tr = btn.closest("tr");
      const reportId = tr.getAttribute("data-id");
      const status = tr.getAttribute("data-status");

      if (status === "รอดำเนินการ") {
        openTrackDetail(reportId);
      } else {
        alert("ไม่สามารถแก้ไขงานซ่อมนี้ได้ เพราะสถานะไม่ใช่ 'รอดำเนินการ'");
      }
    });
  });

  // Delete button
  document.querySelectorAll(".icon-btn.delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const tr = btn.closest("tr");
      selectedId = tr.getAttribute("data-id");
      modalConfirm.classList.add("show");
    });
  });

  // Modal controls
  closeModal.onclick = cancelModal.onclick = () => modalConfirm.classList.remove("show");
  window.onclick = (e) => { if (e.target === modalConfirm) modalConfirm.classList.remove("show"); };

  // Confirm delete
  confirmDelete.onclick = async () => {
    if (!selectedId) return;
    try {
      const response = await fetch(`/api/requests/${selectedId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) throw new Error("ลบรายการไม่สำเร็จ");
      await fetchRepairs();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการลบรายการ");
    } finally {
      modalConfirm.classList.remove("show");
      selectedId = null;
    }
  };
}

// Edit popup modal
async function openTrackDetail(reportId) {
  const modal = document.createElement("div");
  modal.className = "edit-modal";
  Object.assign(modal.style, {
    position: "fixed", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fff", padding: "20px", zIndex: 9999,
    borderRadius: "10px", maxWidth: "500px", width: "90%",
    maxHeight: "80%", overflowY: "auto",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
  });
  modal.innerHTML = `<p>Loading...</p>`;
  document.body.appendChild(modal);

  try {
    const resReport = await fetch(`/api/requests/${reportId}`);
    const report = await resReport.json();

    const resFiles = await fetch(`/api/files/${reportId}`);
    const files = resFiles.ok ? await resFiles.json() : [];

    const existingAttachmentIds = files.map(f => f.id);
    const removedAttachmentIds = [];

    let attachmentsHtml = "";
    files.forEach(f => {
      attachmentsHtml += `
        <div class="attachment-item" data-id="${f.id}" style="display:inline-block;position:relative;margin:5px;">
          <img src="/api/files/${reportId}/${f.id}/download" alt="${f.originalFilename}" style="width:50px;height:50px;">
          <button class="remove-attachment" style="position:absolute;top:0;right:0;background:red;color:#fff;border:none;border-radius:50%;width:18px;height:18px;cursor:pointer;">×</button>
        </div>
      `;
    });

    modal.innerHTML = `
      <h3>รายละเอียดงานซ่อม</h3>
      <p>วันที่แจ้งซ่อม: ${report.createdAt ? report.createdAt.replace("T"," ").slice(0,16) : "-"}</p>
      <p>ชื่อผู้แจ้ง: ${report.reporterName || "-"}</p>
      <p>ผู้รับผิดชอบ: ${report.technician || "-"}</p>
      <label>ประเภทของงาน: <input type="text" id="titleField" value="${report.title || ''}"></label><br>
      <label>สถานที่: <input type="text" id="locationField" value="${report.location || ''}"></label><br>
      <label>รายละเอียดงาน: <textarea id="descField">${report.description || ''}</textarea></label><br>
      <div id="attachmentsContainer">${attachmentsHtml}</div>
      <label>เพิ่มไฟล์แนบ: <input type="file" id="newAttachment" multiple></label><br><br>
      <button id="saveBtn">บันทึก</button>
      <button id="closeBtn">ปิด</button>
    `;

    // Remove existing attachment
    modal.querySelectorAll(".remove-attachment").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const div = btn.closest(".attachment-item");
        const id = Number(div.getAttribute("data-id"));
        div.remove();
        const index = existingAttachmentIds.indexOf(id);
        if (index > -1) existingAttachmentIds.splice(index, 1);
        removedAttachmentIds.push(id);
      });
    });

    modal.querySelector("#closeBtn").addEventListener("click", () => modal.remove());

    // Save changes
    modal.querySelector("#saveBtn").addEventListener("click", async () => {
      const formData = new FormData();
      formData.append("title", modal.querySelector("#titleField").value);
      formData.append("location", modal.querySelector("#locationField").value);
      formData.append("description", modal.querySelector("#descField").value);
      formData.append("existingAttachments", JSON.stringify(existingAttachmentIds));
      formData.append("removedAttachments", JSON.stringify(removedAttachmentIds));

      const newFiles = modal.querySelector("#newAttachment").files;
      for (let i = 0; i < newFiles.length; i++) {
        formData.append("newAttachments", newFiles[i]);
      }

      try {
        const res = await fetch(`/api/requests/${reportId}`, {
          method: "PUT",
          body: formData,
          credentials: "include"
        });
        if (!res.ok) throw new Error("ไม่สามารถบันทึกได้");
        alert("บันทึกสำเร็จ");
        modal.remove();
        await fetchRepairs();
      } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    });

  } catch (err) {
    console.error(err);
    modal.innerHTML = `<p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p><button id="closeBtn">ปิด</button>`;
    modal.querySelector("#closeBtn").addEventListener("click", () => modal.remove());
  }
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/logout", { method: "GET", credentials: "include" });
      if (response.ok) window.location.href = "login.html";
      else alert("ไม่สามารถออกจากระบบได้");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  });
}

// Initial Load
fetchRepairs();
