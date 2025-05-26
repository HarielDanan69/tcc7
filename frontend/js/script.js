const baseUrl = " https://notes-be069-499088901156.us-central1.run.app";
const noteUrl = `${baseUrl}/notes`;
const loginUrl = `${baseUrl}/login`;
const registerUrl = `${baseUrl}/register`;
const logoutUrl = `${baseUrl}/logout`;

let accessToken = localStorage.getItem("accessToken");
let editMode = null;

// Tambahkan token di semua request ke /notes
async function fetchNotes() {
  try {
    const res = await axios.get(noteUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const notes = res.data;
    console.log(notes);
    console.log("tes");
    const noteList = document.getElementById("noteList");
    noteList.innerHTML = "";

    notes.forEach((note) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${note.id}</td>
        <td>${note.judul}</td>
        <td>${note.event}</td>
        <td>${note.tanggal}</td>
        <td>${note.catatan}</td>
        <td>
          <button class="aksi_list1" onclick="editNote(${note.id}, '${note.judul}', '${note.event}', '${note.tanggal}', '${note.catatan}')">Edit</button>
          <button class="aksi_list2" onclick="deleteNote(${note.id})"><p class="al2">Hapus</p></button>
        </td>
      `;
      noteList.appendChild(row);
    });
  } catch (error) {
    if (error.response && error.response.status === 403) {
      alert("Unauthorized! Silakan login.");
    } else {
      console.error("Gagal mengambil data:", error);
    }
  }
}

document
  .getElementById("noteForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const note = {
      judul: document.getElementById("judul").value,
      event: document.getElementById("event").value,
      tanggal: document.getElementById("tanggal").value,
      catatan: document.getElementById("catatan").value,
    };

    const method = editMode ? "patch" : "post";
    const url = editMode ? `${noteUrl}/${editId}` : noteUrl;

    try {
      await axios({
        method,
        url,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        data: note,
      });

      editMode = false;
      editId = null;
      this.reset();
      document.querySelector("button[type='submit']").innerText =
        "Simpan Catatan";
      fetchNotes();
    } catch (error) {
      alert("Gagal menyimpan catatan!");
    }
  });

async function editNote(id) {
  try {
    const res = await axios.get(`${noteUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const note = res.data;

    document.getElementById("judul").value = note.judul;
    document.getElementById("event").value = note.event;
    document.getElementById("tanggal").value = note.tanggal;
    document.getElementById("catatan").value = note.catatan;

    editMode = true;
    editId = note.id;

    document.querySelector("button[type='submit']").innerText =
      "Update Catatan";
  } catch (error) {
    alert("Gagal mengambil data catatan untuk diedit.");
    console.error(error);
  }
}

async function deleteNote(id) {
  try {
    await axios.delete(`${noteUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    fetchNotes();
  } catch (error) {
    alert("Gagal menghapus catatan");
  }
}

// --- LOGIN ---
async function login(email, password) {
  try {
    console.log(email, password);
    const res = await axios.post(
      loginUrl,
      { email, password },
      { withCredentials: true } // ← menambahkan credentials
    );
    console.log("baris2");
    accessToken = res.data.accessToken;
    console.log("baris3");
    localStorage.setItem("accessToken", accessToken);
    console.log("baris4");
    alert("Login berhasil");
    fetchNotes();
  } catch (error) {
    alert("Login gagal");
    console.error("Error saat login:", error);
  }
}

// --- REGISTER ---
async function register(name, email, gender, password) {
  try {
    await axios.post(
      registerUrl,
      { name, email, gender, password },
      { withCredentials: true }
    );
    alert("Register berhasil! Silakan login.");
  } catch (error) {
    alert("Register gagal");
  }
}

// --- LOGOUT ---
async function logout() {
  try {
    await axios.delete(logoutUrl, { withCredentials: true });
  } catch (error) {
    console.log(error);
    // boleh diabaikan, logout tetap lanjut
  }
  localStorage.removeItem("accessToken");
  accessToken = null;
  alert("Logout berhasil");
  window.location.href = "login.html";
}
