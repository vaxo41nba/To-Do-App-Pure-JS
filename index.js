document.cookie = "same-site-cookie=foo; SameSite=Lax";
document.cookie = "cross-site-cookie=bar; SameSite=None; Secure";

const activateButtons = () => {
  const checkbox = document.querySelectorAll('input[type="checkbox"]');
  checkbox.forEach((check) =>
    check.addEventListener("click", (e) => handleCheckboxClick(e))
  );

  const editButton = document.querySelectorAll("#editButton");
  editButton.forEach((edBtn) =>
    edBtn.addEventListener("click", (e) => handleEditClick(e))
  );

  const deleteButton = document.querySelectorAll("#deleteButton");
  deleteButton.forEach((delbtn) =>
    delbtn.addEventListener("click", (e) => handleDeleteClick(e))
  );

  const completeBtn = document.getElementById("completeBtn");
  completeBtn.addEventListener("click", () => handleSelectAll());

  const uncompleteBtn = document.getElementById("uncompleteBtn");
  uncompleteBtn.addEventListener("click", () => handleUnselectAll());

  const removeAllBtn = document.getElementById("removeAllBtn");
  removeAllBtn.addEventListener("click", (e) => handleRemoveAll(e));
};

const stringToHTML = (str) => {
  const parser = new DOMParser();
  let doc = parser.parseFromString(str, "text/html");
  return doc.body.firstElementChild;
};

const get = () => {
  axios
    .get("http://localhost:8000/")
    .then((response) => {
      for (i = 0; i < response.data.length; i++) {
        const html = `
      <li class="show">
        <span class="id">${response.data[i]._id}</span>
<input type="checkbox" ${response.data[i].checked === true ? "checked" : ""}>
<label style="text-decoration: ${
          response.data[i].checked === true ? "line-through" : "none"
        }">${response.data[i].value}</label>
        <button id="editButton">Edit </button>
        <span class="id">${response.data[i]._id}</span>
        <button id="deleteButton">Delete</button>
      </li>`;

        ul.appendChild(stringToHTML(html));
      }

      setPageCount();
      drawList();
      activateButtons();
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const input = document.getElementById("listItem");
const button = document.getElementById("button");
const completeBtn = document.getElementById("completeBtn");
const uncompleteBtn = document.getElementById("uncompleteBtn");
const removeAllBtn = document.getElementById("removeAllBtn");
const ul = document.getElementById("list");
const nextButton = document.getElementById("next");
nextButton.disabled = true;
const pageButton = document.getElementById("page");
const previousButton = document.getElementById("previous");
previousButton.disabled = true;
const numberPerPage = 5;
let currentPage = 1;
let numberOfPages = 1;
nextButton.addEventListener("click", () => {
  currentPage++;
  pageButton.value = currentPage;
  drawList();
});
previousButton.addEventListener("click", () => {
  currentPage--;
  pageButton.value = currentPage;
  drawList();
});
const drawList = () => {
  const items = [...ul.children];
  const start = (currentPage - 1) * numberPerPage;
  const end = start + numberPerPage;
  items.forEach((item, index) => {
    if (index >= start && index < end) {
      item.className = "show";
    } else {
      item.className = "hide";
    }
  });

  nextButton.disabled = currentPage === numberOfPages || items.length === 0;
  previousButton.disabled = currentPage <= 1;
};
const setPageCount = () => {
  const items = [...ul.children];
  numberOfPages = Math.ceil(items.length / numberPerPage);
};

const handleCheckboxClick = (e) => {
  const id = e.target.previousElementSibling.innerHTML;
  if (e.target.checked) {
    e.target.nextElementSibling.style = "text-decoration: line-through";
    axios
      .put(`http://localhost:8000/edit/${id}`, { checked: true })
      .then((doc) => {
        if (!doc) {
          return doc.status(404).end();
        }
        return doc.status(200).json(doc);
      })
      .catch((err) => console.log(err));
  } else {
    e.target.nextElementSibling.style = "text-decoration: none";
    axios
      .put(`http://localhost:8000/edit/${id}`, { checked: false })
      .then((doc) => {
        if (!doc) {
          return doc.status(404).end();
        }
        return doc.status(200).json(doc);
      })
      .catch((err) => console.log(err));
  }
};

const handleEditClick = (e) => {
  const inputBar = document.createElement("input");
  let target = e.target;
  let parElement = target.parentElement;
  inputBar.placeholder = "Please add items...";
  inputBar.size = Math.max(
    parElement.children[1].textContent.length + 2,
    inputBar.placeholder.length
  );
  parElement.insertBefore(inputBar, e.target);
  inputBar.value = parElement.children[2].textContent;
  const id = e.target.nextElementSibling.innerHTML;
  inputBar.onkeyup = (event) => {
    if (event.keyCode === 13 && inputBar.value.trim()) {
      parElement.removeChild(inputBar);
      parElement.children[2].textContent = inputBar.value;
      target.className = "";

      axios
        .put(`http://localhost:8000/edit/${id}`, { value: inputBar.value })
        .then((doc) => {
          if (!doc) {
            return doc.status(404).end();
          }
          return doc.status(200).json(doc);
        })
        .catch((err) => console.log(err));
    }
  };
  target.className = "hide";
};

const handleDeleteClick = (e) => {
  const items = [...ul.children];
  const id = e.target.previousElementSibling.innerHTML;

  axios
    .delete(`http://localhost:8000/delete/${id}`)
    .then((doc) => {
      if (!doc) {
        console.log("Error");
      }
      console.log("Successfully deleted");
    })
    .catch((error) => {
      console.log(error + " Unable to delete");
    });

  e.target.parentElement.remove();
  if (items.length % numberPerPage === 1) previousButton.click();
  setPageCount();
  drawList();
};

const handleSelectAll = () => {
  const items = [...ul.children];
  items.forEach((item) => {
    if (!item.children[1].checked) {
      item.children[1].checked = true;
      item.children[2].style = "text-decoration: line-through";
    }
  });

  axios
    .put(`http://localhost:8000/selectAll`)
    .then((res) => {
      if (!res) console.log(error);
    })
    .catch((error) => {
      console.log(error);
    });
};

const handleUnselectAll = () => {
  const items = [...ul.children];
  items.forEach((item) => {
    if (item.children[1].checked) {
      item.children[1].checked = false;
      item.children[2].style = "text-decoration: none";
    }
  });

  axios
    .put(`http://localhost:8000/unSelectAll`)
    .then((res) => {
      if (!res) console.log(error);
    })
    .catch((error) => {
      console.log(error);
    });
};

const handleRemoveAll = () => {
  const items = [...ul.children];
  items.forEach((item) => {
    if (item.children[1].checked) {
      item.lastElementChild.click();
    }
  });

  axios
    .delete(`http://localhost:8000/deleteSelected/`)
    .then((doc) => {
      if (!doc) {
        console.log("Error");
      }
      ("Successfully deleted");
    })
    .catch((error) => {
      console.log(error);
    });
};

const addItem = () => {
  const items = [...ul.children];

  if (input.value.trim()) {
    // axios
    //   .post("http://localhost:8000/add", { value: input.value, checked: false })
    //   .then((response) => {
        const html = `
          <li class="show">
    <input type="checkbox">
    <label>${input.value}</label>
            <button id="editButton">Edit </button>
            <button id="deleteButton">Delete</button>
          </li>`;

        ul.appendChild(stringToHTML(html));
        setPageCount();
        drawList();
        if ((items.length + 1) % numberPerPage === 1) nextButton.click();
        activateButtons();
      // })
      // .catch((err) => {
      //   console.log(err + " unable to save to database");
      // });
  } else {
    alert("Please input value");
  }
};

button.addEventListener("click", () => {
  addItem();
  console.log(`To-Do item "${input.value}" was saved to database`);
  input.value = "";
});

input.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    e.preventDefault();
    button.click();
  }
});

window.onload = get;
